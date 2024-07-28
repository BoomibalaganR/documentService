const express = require('express')
const { validate } = require('../../middleware/validateMiddleware')
const { identityDocumentController } = require('../../controllers')
const { identityDocsValidation } = require('../../validations')
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

// router.get(
// 	'/doc/:doc_id',
// 	identityDocumentController.getIdentityDocumentByDocId
// ) // Get specific identity document by doc id

/**
 * Route to handle operations for all identity documents under a specific category.
 */
router
	.route('/:cat')
	.get(validCategory, identityDocumentController.getAllIdentityDocuments) // Get all identity documents under the specified category
	.post(
		validCategory,
		validate(identityDocsValidation.addIdentitydocs), // Validate the request body
		identityDocumentController.addIdentityDocument // Add identity document
	)

/**
 * Route to handle operations for a specific identity document under a category and document type.
 */
router
	.route('/:cat/:doctype')
	.get(validCategory, identityDocumentController.getIdentityDocumentByDocType) // Get an identity document by document type
	.put(
		validCategory,
		validate(identityDocsValidation.updateIdentitydocs), // Validate the request body
		identityDocumentController.updateIdentityDocument // Update identity document
	)
	.delete(validCategory, identityDocumentController.deleteIdentityDocument) // Delete an identity document by document type

module.exports = router
