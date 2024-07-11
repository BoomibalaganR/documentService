const ApiError = require('../utils/ApiError')
const logger = require('../../config/logger') 
const httpStatus = require('http-status')
const { verifyToken } = require('../utils/token')

/**
 * Middleware to authenticate a JWT token.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ApiError} - If the token is missing or invalid.
 */
const authenticateToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // If token is missing, return unauthorized
    if (!token) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'UnAuthorized'))
    }

    const decodedToken = verifyToken(token)

    // If authenticated, add coffer_id into request
    req.user = decodedToken
    logger.info('Successfully authenticated')
    next()
}

module.exports = { authenticateToken }
