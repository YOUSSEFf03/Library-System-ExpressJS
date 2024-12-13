const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Author = require('../models/Author');
const Member = require('../models/Member');
const nodemailer = require('nodemailer');


router.get('/books', async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, language = 'en' } = req.query;
    const query = { isPublished: true };
    if (genre) query.genre = genre;

    const books = await Book.find(query)
      .select('title description genre coverImageUrl isBorrowable')
      .sort({ numberOfAvailableCopies: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/books/:id', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const book = await Book.findById(req.params.id).select(
      'title description isbn genre numberOfAvailableCopies numberOfBorrowableDays isOpenToReviews authorId publishedDate'
    );

    if (!book) return res.status(404).json({ message: 'Book not found' });

    const bookDetails = {
      title: book.title[language],
      description: book.description[language],
      isbn: book.isbn,
      genre: book.genre,
      numberOfAvailableCopies: book.numberOfAvailableCopies,
      numberOfBorrowableDays: book.numberOfBorrowableDays,
      isOpenToReviews: book.isOpenToReviews,
      authorId: book.authorId,
      publishedDate: book.publishedDate,
    };

    res.json(bookDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/authors/:id', async (req, res) => {
  try {
    console.log('Fetching author with ID:', req.params.id);
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.json(author);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;



router.get('/members/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    res.json({
      _id: member._id,
      name: member.name,
      email: member.email,
      borrowedBooks: member.borrowedBooks,
      returnRate: member.returnRate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



  

router.post('/members/:memberId/borrow/:bookId', async (req, res) => {
  try {
    const { memberId, bookId } = req.params;


    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    
    if (book.numberOfAvailableCopies <= 0) {
      return res.status(400).json({ message: 'This book is not available for borrowing' });
    }

    
    if (member.returnRate < 30) {
      return res.status(400).json({ message: 'Member cannot borrow a book due to low return rate' });
    }

    
    if (member.age < book.minAge) {
      return res.status(400).json({ message: 'Member does not meet the minimum age requirement for this book' });
    }

   
    member.borrowedBooks.push({
      borrowedBookId: bookId,
      borrowedDate: new Date(),
      returnDate: new Date(Date.now() + book.numberOfBorrowableDays * 24 * 60 * 60 * 1000), 
    });

   
    await member.save();

 
    book.numberOfAvailableCopies -= 1;
    await book.save();


    res.json({ message: 'Book borrowed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




router.get('/members/:id/borrowed-books', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const borrowedBooks = member.borrowedBooks.map((borrowedBook) => {
      const daysLeft = Math.ceil(
        (new Date(borrowedBook.returnDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        borrowedBookId: borrowedBook.borrowedBookId,
        daysLeft,
        flags: {
          warning: daysLeft <= 0.5,
          expired: daysLeft < 0,
        },
      };
    });

    res.json(borrowedBooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

  

  












router.post('/members/:memberId/subscribe/:bookId', async (req, res) => {
  try {
    const { memberId, bookId } = req.params;

    
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    
    if (member.subscribedBooks.includes(bookId)) {
      return res.status(400).json({ message: 'Already subscribed to this book' });
    }

  
    member.subscribedBooks.push(bookId);

  
    await member.save();

    res.json({ message: 'Subscribed to the book successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

  









router.post('/members/:memberId/unsubscribe/:bookId', async (req, res) => {
  try {
    const { memberId, bookId } = req.params;

  
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

  
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    
    if (!member.subscribedBooks.includes(bookId)) {
      return res.status(400).json({ message: 'You are not subscribed to this book' });
    }

    member.subscribedBooks = member.subscribedBooks.filter(id => id.toString() !== bookId);

    await member.save();

    res.json({ message: 'Unsubscribed from the book successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


  








router.post('/members/:memberId/return/:bookId', async (req, res) => {
  try {
    const { memberId, bookId } = req.params;

  
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });


    const borrowedBook = member.borrowedBooks.find(b => b.borrowedBookId.toString() === bookId);
    if (!borrowedBook) return res.status(404).json({ message: 'Borrowed book not found' });

    
    const isOnTime = new Date() <= borrowedBook.returnDate;

    
    if (isOnTime) {
      member.returnRate = (member.returnRate * (member.borrowedBooks.length - 1) + 100) / member.borrowedBooks.length; // Increase return rate
    } else {
      member.returnRate = (member.returnRate * (member.borrowedBooks.length - 1) - 100) / member.borrowedBooks.length; // Decrease return rate
    }

    
    member.borrowedBooks = member.borrowedBooks.filter(b => b.borrowedBookId.toString() !== bookId);

    
    book.numberOfAvailableCopies += 1;

  
    await member.save();
    await book.save();

    res.json({ message: `Book returned successfully, return rate updated to ${member.returnRate}%` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
