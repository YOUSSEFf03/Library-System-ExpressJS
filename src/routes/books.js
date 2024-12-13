const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Member = require('../models/Member');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Multer configuration for cover image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  
});

// CREATE: Add a new book with cover image
router.post('/', upload.single('coverImage'), async (req, res) => {
  try {
    const { title, isbn, genre, description, numberOfAvailableCopies, minAge, authorId, publishedDate, isPublished } = req.body;
    const coverImageUrl = req.file ? req.file.path : null; // If a file is uploaded, store the file path

    const book = new Book({
      title,
      isbn,
      genre,
      description,
      numberOfAvailableCopies,
      isBorrowable: true,
      numberOfBorrowableDays: 14,
      isOpenToReviews: false,
      minAge,
      authorId,
      coverImageUrl,
      publishedDate,
      isPublished,
    });

    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ: Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ: Fetch all books with pagination and sorting
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', genre, title, isbn } = req.query;

    const query = {};
    if (genre) query.genre = genre;
    if (title) query['title.en'] = { $regex: title, $options: 'i' };
    if (isbn) query.isbn = isbn;

    const sortOrder = order === 'asc' ? 1 : -1;

    const books = await Book.find(query)
      .select('-updatedAt -coverImageUrl')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ: Get a specific book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE: Edit an existing book
router.put('/:id', async (req, res) => {
  try {
    const allowedFields = [
      'title',
      'description',
      'isbn',
      'genre',
      'numberOfAvailableCopies',
      'minAge',
      'authorId',
      'publishedDate',
    ];

    const updateFields = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Replace the cover image when updating a book
router.put('/:id/cover', upload.single('coverImage'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const coverImageUrl = req.file ? req.file.path : null;
    book.coverImageUrl = coverImageUrl;

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: Remove a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUBLISH: Publish a book and send email to subscribers
router.put('/:id/publish', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const members = await Member.find({ subscribedBooks: book._id });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    members.forEach(async (member) => {
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: member.email,
        subject: `The book "${book.title.en}" is now published!`,
        text: `Hello, the book "${book.title.en}" you subscribed to has been published!`,
      };

      await transporter.sendMail(mailOptions);
    });

    res.json({ message: 'Book published and emails sent to subscribers' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UNPUBLISH: Unpublish a book
router.put('/:id/unpublish', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isPublished: false }, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    res.json({ message: 'Book unpublished successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Books Publish Rate Route
router.get('/books-publish-rate', async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const publishedBooks = await Book.countDocuments({ isPublished: true });

    const publishRate = totalBooks > 0 ? (publishedBooks / totalBooks) * 100 : 0;

    res.json({ publishRate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Average Return Rate Route
router.get('/average-return-rate', async (req, res) => {
  try {
    const members = await Member.find();
    const totalMembers = members.length;
    const totalReturnRate = members.reduce((acc, member) => acc + member.returnRate, 0);
    const averageReturnRate = totalMembers > 0 ? totalReturnRate / totalMembers : 0;

    res.json({ averageReturnRate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
