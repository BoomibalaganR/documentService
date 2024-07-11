const jwt = require('jsonwebtoken')
const ApiError = require('./ApiError')
const httpStatus = require('http-status')
const config = require('../../config/env')

const SECRET_KEY = config.auth.secret
const JWT_EXPIRE = config.auth.expire


/**
 * Generates a JWT token.
 * 
 * @param {Object} con - The payload containing user details.
 * @param {string} con.coffer_id - The user identifier.
 * @param {string} con.pk - The primary key for the user.
 * @returns {string} - The generated JWT token.
 */
const generateToken = (con) => { 
    const payload = {
        coffer_id: con.coffer_id, 
        pk: con.pk
    }
    
    // Generate JWT token with secret key and expiration time
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: JWT_EXPIRE })
    return token
}

/**
 * Verifies a JWT token.
 * 
 * @param {string} token - The JWT token to verify.
 * @returns {Object} - The decoded token payload.
 * @throws {ApiError} - If the token is expired or invalid.
 */
const verifyToken = (token) => {
    return jwt.verify(token, SECRET_KEY, (err, decodedToken) => { 
        if (err) {
            if (err.name === 'TokenExpiredError') { 
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Token has expired')
            } 
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token')
        } 
        return decodedToken
    })
}

module.exports = {
    generateToken, 
    verifyToken
}
