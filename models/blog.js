const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  author: String,
  title: String,
  url: String,
  upvotes: Number
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)