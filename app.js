const blogRoutes = require('./controllers/blogs')
const logger = require('./utils/logger')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const express = require('express')
const app = express()
const cors = require('cors')
const { default: mongoose } = require('mongoose')
mongoose.set('strictQuery', false)

logger.info(`Connecting to ${config.MONGODB_URI}`)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((err) => {
    logger.error(`Impossible to connect to MongoDB: ${err.message}`)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogRoutes)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app