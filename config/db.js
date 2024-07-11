const mongoose = require('mongoose')
const logger = require('./logger') 
const config = require('./env')

// Connect to MongoDB
mongoose
    .connect(config.db.uri)
    .then(() => logger.info("Database connected successfully"))
    .catch((err) => logger.info(`Something went wrong with MongoDB connection: ${err.message}`))


module.exports = mongoose;