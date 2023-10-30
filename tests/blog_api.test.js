const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()
})

describe('Blog operations', () => {
  let token = ''
  beforeEach(async () => {
    let newUser = {
      username: 'bat',
      name: 'bat man',
      password: 'hello'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)

    let loginUser = await api
      .post('/api/login')
      .send(newUser)
      .expect(200)

    token = loginUser.body.token
  })

  test('create a blog', async () => {
    let newBlog = {
      title: 'Ernesto della roccia',
      author: 'Dante Alighieri',
      url: 'www.dellaroccia.com',
      upvotes: 12
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-type', /application\/json/)

    const blogAfterPost = await helper.blogsInDb()
    expect(blogAfterPost).toHaveLength(helper.initialBlogs.length + 1)
  })

  test('delete a blog', async () => {
    const newBlog = {
      title: 'eagle in the sky',
      url: 'www.now.it'
    }

    const createBlog = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart.find(b => createBlog.body.id === b.id)
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

  })

  test('update a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      author: 'Sampino Laviola',
      title: 'the wise',
      url: 'www.www.www.www',
      upvotes: 1
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(201)

  })

  test('check if upvotes value miss', async () => {
    const newBlog = {
      author: 'Michale Scofield',
      title: 'Prison Break',
      url: 'www.www.com',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-type', /application\/json/)

    expect(newBlog.upvotes).not.toBeDefined()
  })

  test('bad request if title or url are missing', async () => {
    const newBlog = {
      author: 'Michale Scofield',
      upvotes: 23
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect('Content-type', /application\/json/)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('unique identifier is named id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-type', /application\/json/)

    expect(resultBlog.body.id).toBeDefined()
  })

})

describe('User operations', () => {

  test('create user', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('failing on add user with wrong user or password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'a',
      name: 'Matti Luukkainen',
      password: 's',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    const usernames = await usersAtEnd.map(u => u.username)
    expect(usernames).not.toContain(newUser.username)

  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
