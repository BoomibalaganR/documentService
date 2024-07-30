const axios = require('axios')
const logger = require('../../config/logger')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')
const config = require('../../config/env')

const GATEWAY_URI = config.gatewayService.url
//;('https://consumer-service-50021505566.development.catalystappsail.in')

/**
 * Get category data from the consumer microservice.
 *
 * @param {string} cat - Category identifier
 * @param {string} token - Authorization token
 * @returns {Promise<object>} Category data
 */
exports.getCategory = async (cat, token) => {
	const response = await axios.get(
		`${GATEWAY_URI}/api/v1/consumers/citizenship/${cat}`,
		{
			headers: {
				Authorization: token
			}
		}
	)
	logger.info(
		`Successfully retrieved ${cat} citizenship from consumer service`
	)
	return response.data
}

exports.getConsumerByCoffer_id = async (coffer_id, token) => {
	const response = await axios.get(
		`${GATEWAY_URI}/api/v1/consumers/${coffer_id}`,
		{
			headers: {
				Authorization: token
			}
		}
	)
	logger.info(
		`Successfully retrieved ${cat} citizenship from consumer service`
	)
	return response.data
}

exports.validateRelationship = async (coffer_id, rel_id, rel_type, token) => {
	const response = await axios.get(
		`${GATEWAY_URI}/api/v1/consumers/relationships/${rel_id}`,
		{
			headers: {
				Authorization: token
			},
			validateStatus: function (status) {
				// Resolve the promise for any status code
				return true
			}
		}
	)

	if (response.status === httpStatus.NOT_FOUND) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'relationship not found')
	}

	const relationshipData = response.data
	if (response.status === httpStatus.OK && !relationshipData.isaccepted) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Relationship not accepted ')
	}
	logger.info(`Successfully return relationship data`)
	return relationshipData
}
