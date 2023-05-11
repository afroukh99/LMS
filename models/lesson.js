const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define lesson schema
const lessonSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  pdfFilePath: {
    type: String,
    required: true
  },
  imgFilePath: {
    type: String
  },
    createdAt: {
    type: Date,
    default: Date.now
  }
});



// Define lesson model
const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
