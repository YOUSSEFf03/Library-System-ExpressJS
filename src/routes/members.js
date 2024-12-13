const express = require('express');
const router = express.Router();
const Member = require('../models/Member');



// Route: POST /
router.post('/', async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Route: GET /
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sort = 'returnRate', order = 'desc' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;

    const members = await Member.find(query)
      .select('name username email borrowedBooks returnRate -_id')
      .sort({ [sort]: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Route: PUT /:id
router.put('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route: DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
