const blogRoutes = require('express').Router()
const Blog = require('../models/blog')

blogRoutes.get('/', (req, res) => {
  Blog
    .find({})
    .then(blogs => {
      res.json(blogs)
    })
})

blogRoutes.post('/', (req, res) => {
  const blog = new Blog(req.body)

  if (!blog) {
    return res.status(400).send({
      error: 'there is an error'
    })
  }

  blog
    .save()
    .then(result => {
      res.status(201).json(result)
    })
})

module.exports = blogRoutes