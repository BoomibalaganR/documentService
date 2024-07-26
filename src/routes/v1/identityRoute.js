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

/**
 * Middleware to check category for the routes with ':cat' parameter.
 */
router.use('/:cat', validCategory)

router
	.route('/doc/:doc_id')
	.get(identityDocumentController.getIdentityDocumentByDocId) // Get all identity documents under the specified category

/**
 * Route to handle operations for all identity documents under a specific category.
 */
router
	.route('/:cat')
	.get(identityDocumentController.getAllIdentityDocuments) // Get all identity documents under the specified category
	.post(
		validate(identityDocsValidation.addIdentitydocs), // Validate the request body
		identityDocumentController.addIdentityDocument // Add identity document
	)

/**
 * Route to handle operations for a specific identity document under a category and document type.
 */
router
	.route('/:cat/:doctype')
	.get(identityDocumentController.getIdentityDocumentByDocType) // Get an identity document by document type
	.put(
		validate(identityDocsValidation.updateIdentitydocs), // Validate the request body
		identityDocumentController.updateIdentityDocument // Update identity document
	)
	.delete(identityDocumentController.deleteIdentityDocument) // Delete an identity document by document type

module.exports = router
