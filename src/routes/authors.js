const express = require('express');
const router = express.Router();
const Author = require('../models/Author');



// CREATE: Add a new author
router.post('/', async (req, res) => {
  try {
    const { name, biography, email, profileImageUrl, birthDate } = req.body;
    const author = new Author({
      name,
      biography,
      email,
      profileImageUrl,
      birthDate,
    });

    await author.save();
    res.status(201).json(author);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ: Get all authors
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





// READ: Get a single author by ID
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: 'Author not found' });
    res.json(author);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE: Edit an existing author
router.put('/:id', async (req, res) => {
  try {
    const { name, biography, email, profileImageUrl, birthDate } = req.body;
    const updateFields = { name, biography, email, profileImageUrl, birthDate };

    const author = await Author.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!author) return res.status(404).json({ message: 'Author not found' });

    res.json(author);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// DELETE: Remove an author by ID
router.delete('/:id', async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) return res.status(404).json({ message: 'Author not found' });
    res.json({ message: 'Author deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
