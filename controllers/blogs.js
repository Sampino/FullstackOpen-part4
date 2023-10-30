const blogRoutes = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const userExtractor = require('../utils/middleware').userExtractor

blogRoutes.get('/', async (req, res) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  res.json(blogs)
})

blogRoutes.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (blog) {
    res.status(200).json(blog)
  } else {
    res.status(404).json({ content: 'blog not found' })
  }

})

blogRoutes.post('/', userExtractor, async (req, res) => {
  const { author, title, url, upvotes } = req.body
  const user = req.user

  const blogData = {
    author,
    title,
    url,
    upvotes: upvotes !== undefined ? upvotes : 0,
    user: user
  }

  const blog = new Blog(blogData)

  if (!title || !url) {
    return res.status(400).json({ content: 'bad request' })
  }

  const savedBlog = await blog.save()

  const userDb = await User.findById(user)
  userDb.blogs = userDb.blogs.concat(blog._id)
  await userDb.save()
  res.status(201).json(savedBlog)

})

blogRoutes.delete('/:id', userExtractor, async (req, res) => {
  const user = req.user
  const blog = await Blog.findById(req.params.id)
  console.log('USER--->', user)
  console.log('BLOG--->', blog)
  if (!blog) {
    return res.status(404).json({ content: 'blog not found' })
  }

  if (blog.user.toString() !== user.toString()) {
    return res.status(403).json({ error: 'forbidden, you do not have permission to delete this blog' })
  }

  const userDb = await User.findById(user)
  await Blog.findByIdAndRemove(req.params.id)
  userDb.blogs = userDb.blogs.filter(b => b.toString() !== req.params.id)
  await userDb.save()

  res.status(204).json(blog)
})

blogRoutes.put('/:id', async (req, res) => {
  const { author, title, url, upvotes } = req.body

  const blog = {
    author,
    title,
    url,
    upvotes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })

  if (updatedBlog) {
    res.status(201).json(blog)
  } else {
    res.status(404).json({ content: 'blog not found' })
  }

})

module.exports = blogRoutes