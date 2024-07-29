const express = require('express')
const { validate } = require('../../middleware/validateMiddleware')
const { sharedDocumentController } = require('../../controllers')
const { sharedDocsValidation } = require('../../validations')
const {
	checkValidRelationship
} = require('../../middleware/checkValidRelationship')
const logger = require('../../../config/logger')
const router = express.Router()

/**
 * Middleware to log incoming requests to the consumer routes.
 */
router.use((req, res, next) => {
	logger.info(`shared document routes ${req.originalUrl}`)
	next()
})

router.post(
	'/share',
	validate(sharedDocsValidation.documentShareSchema),
	checkValidRelationship,
	sharedDocumentController.shareDocuments
)

router.post(
	'/unshare',
	validate(sharedDocsValidation.documentShareSchema),
	checkValidRelationship,
	sharedDocumentController.unShareDocuments
)

router.get(
	'/byme/:rel_id',
	checkValidRelationship,
	sharedDocumentController.getDocumentSharedByMe
)
router.get(
	'/withme/:rel_id',
	checkValidRelationship,
	sharedDocumentController.getDocumentSharedWith
)

module.exports = router
