const logger = require('../../config/logger')

const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')
const { default: axios } = require('axios')

const CONSUMERSERVICE = 'http://127.0.0.1:3001'

exports.validateRelationship = async (coffer_id, rel_id, rel_type, token) => {
	//make external api call to relationship service
	// const validatedMockData = {
	// 	status: httpStatus.OK,
	// 	data: {
	// 		_id: rel_id,
	// 		requestor_uid: coffer_id,
	// 		acceptor_uid: '1245666',
	// 		status: 'accepted',
	// 		isaccepted: true,
	// 		description: 'please accept request'
	// 	}
	// }
	// const inValidatedMockData = {
	// 	status: httpStatus.NOT_FOUND,
	// 	data: {
	// 		_id: rel_id,
	// 		requestor_uid: coffer_id,
	// 		acceptor_uid: '1245666',
	// 		status: 'accepted',
	// 		isaccepted: true,
	// 		description: 'please accept request'
	// 	}
	// }

	// const response = await Promise.resolve(validatedMockData)

	const response = await axios.get(
		`${CONSUMERSERVICE}/api/v1/consumers/relationships/${rel_id}`,
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
