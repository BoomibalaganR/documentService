const express = require('express')
const { validate } = require('../../middleware/validateMiddleware')
const { sharedDocumentController } = require('../../controllers')
const { sharedDocsValidation } = require('../../validations')
const { validCategory } = require('../../middleware/validCategory')
const logger = require('../../../config/logger')
const router = express.Router()

/**
 * Middleware to log incoming requests to the consumer routes.
 */
router.use((req, res, next) => {
	logger.info(`document routes ${req.originalUrl}`)
	next()
})

router.post('/share', sharedDocumentController.shareDocuments) 


// router.get('/byMe') 
// router.get('/sharedWith')

// router
// 	.route('/:cat')
// 	.get(validCategory, identityDocumentController.getAllIdentityDocuments) // Get all identity documents under the specified category
// 	.post(
// 		validCategory,
// 		validate(identityDocsValidation.addIdentitydocs), // Validate the request body
// 		identityDocumentController.addIdentityDocument // Add identity document
// 	)


module.exports = router
