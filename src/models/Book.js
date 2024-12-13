const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  isbn: { type: String, unique: true, required: true },
  genre: { type: String, required: true },
  description: {
    en: { type: String },
    ar: { type: String },
  },
  numberOfAvailableCopies: { type: Number, required: true },
  isBorrowable: { type: Boolean, default: true },
  numberOfBorrowableDays: { type: Number, default: 14 },
  isOpenToReviews: { type: Boolean, default: false },
  minAge: { type: Number, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
  coverImageUrl: { type: String },
  publishedDate: { type: Date },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Book', BookSchema);
