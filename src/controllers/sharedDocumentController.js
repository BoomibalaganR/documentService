const httpStatus = require('http-status')
const { catchAsync } = require('../utils/catchAsync')
const { sharedDocumentService } = require('../services')


exports.shareDocuments = catchAsync(async (req, res, next) => {
	const cofferId = req.user.coffer_id 
    const payload = req.body

	const data = await sharedDocumentService.sharedDocuments(
		cofferId,
		category
	)
	
	res.status(httpStatus.OK).json(data)
})