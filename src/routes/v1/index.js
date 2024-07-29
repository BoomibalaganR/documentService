const express = require('express')
const identityRoutes = require('./identityRoute')
const sharedRoutes = require('./sharedRoute')
const { authenticateToken } = require('../../middleware/authMiddleware')

const router = express.Router()

/**
 * Middleware to authenticate JWT token for all routes.
 */
router.use(authenticateToken)

/**
 * Route to handle requests related to identity documents.
 * All routes in identityRoutes will be prefixed with '/identity'.
 */
router.use('/identity', identityRoutes)

router.use('/shared', sharedRoutes)

module.exports = router
