const logger = require('../../config/logger')

const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')

exports.validateRelationship = async (coffer_id, rel_id, rel_type) => {
	//make external api call to relationship service
	const validatedMockData = {
		statusCode: httpStatus.OK,
		data: {
			_id: rel_id,
			requestor_uid: coffer_id,
			acceptor_uid: '1245666',
			status: 'accepted',
			isaccepted: true,
			description: 'please accept request'
		}
	}

	const response = Promise.resolve(validatedMockData)

	if (response.statusCode === httpStatus.NOT_FOUND) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'relationship not found')
	}

	const relationshipData = response.data
	if (response.statusCode === httpStatus.OK && !relationshipData.isaccepted) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Relationship not accepted ')
	}
	return relationshipData
}
