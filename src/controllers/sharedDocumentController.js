const httpStatus = require('http-status')
const { catchAsync } = require('../utils/catchAsync')
const { sharedDocumentService } = require('../services')

exports.shareDocuments = catchAsync(async (req, res, next) => {
	const cofferId = req.user.coffer_id
	const payload = req.body

	const data = await sharedDocumentService.shareDocuments(cofferId, payload)

	res.status(httpStatus.OK).json(data)
})

exports.unShareDocuments = catchAsync(async (req, res, next) => {
	const cofferId = req.user.coffer_id
	const payload = req.body

	const data = await sharedDocumentService.unShareDocuments(cofferId, payload)
	res.status(httpStatus.OK).json(data)
})

exports.getDocumentSharedByMe = catchAsync(async (req, res, next) => {
	const { coffer_id } = req.user
	const { rel_id } = req.params

	const data = await sharedDocumentService.getDocumentSharedByMe(
		coffer_id,
		rel_id
	)

	res.status(httpStatus.OK).json(data)
})

exports.getDocumentSharedWith = catchAsync(async (req, res, next) => {
	const cofferId = req.user.coffer_id
	const { rel_id } = req.params

	const data = await sharedDocumentService.getDocumentSharedWith(
		cofferId,
		rel_id
	)
	res.status(httpStatus.OK).json(data)
})
