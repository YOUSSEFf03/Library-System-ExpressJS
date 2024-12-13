const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  birthDate: { type: Date, required: true },
  subscribedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  borrowedBooks: [
    {
      borrowedBookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      borrowedDate: { type: Date, required: true },
      returnDate: { type: Date, required: true },
    },
  ],
  returnRate: { type: Number, default: 100 },
});

module.exports = mongoose.model('Member', MemberSchema);
