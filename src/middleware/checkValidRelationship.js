const { consumerService } = require('../services')
const { catchAsync } = require('../utils/catchAsync')
const logger = require('../../config/logger')

/**
 * Middleware to check and add category data to the request body.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.checkValidRelationship = catchAsync(async (req, res, next) => {
	const { rel_id, rel_type } = req.body
	if (!rel_id) {
		rel_id = req.params.rel_id
	}
	const coffer_id = req.user
	logger.info(`Middleware to validate relationship`)
	const token = req.headers['authorization']

	try {
		// validate the relationship using consumer service
		const relationshipData = await consumerService.validateRelationship(
			coffer_id,
			rel_id,
			rel_type,
			token
		)
		req.body.relationship = relationshipData
		logger.info(`valid relationship`)
		next()
	} catch (error) {
		next(error)
	}
})
