const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const helmet = require('helmet') 

const errorHandler = require("./middleware/errorHandler")
const upload = require('./middleware/multerMiddleware') 

const routesV1 = require("./routes/v1") 
const ApiError = require("./utils/ApiError")
const app = express()


// to set various header for security
app.use(helmet())

// CORS configuration for specific origin
const corsOptions = {
	origin: 'https://editor.swagger.io' 
}
app.use(cors(corsOptions))


// Middleware to handle multipart/form-data for file uploads
app.use(upload.single('file')) // 'file' is the field name 

// Middleware to parse JSON bodies
app.use(bodyParser.json())

// Routes for API version v1
app.use("/api/v1/documents", routesV1) // documents-related routes


// Middleware to handle requests for undefined routes
app.all("*", (req, res, next) => {
	next(new ApiError(400, `Can't find ${req.originalUrl} on this server`))
})

// Global error handle middleware
app.use(errorHandler)



module.exports = app
