const httpStatus = require('http-status')
const { catchAsync } = require('../utils/catchAsync')
const { identitydocumentService } = require('../services')

/**
 * Get all identity documents for a specific user and category.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.getAllIdentityDocuments = catchAsync(async (req, res, next) => {
	const cofferId = req.user.coffer_id
	const category = req.params.cat

	const data = await identitydocumentService.getAllIdentityDocument(
		cofferId,
		category
	)
	console.log('data', data)
	res.status(httpStatus.OK).json({ data: data })
})

/**
 * Get identity documents by document type for a specific user and category.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.getIdentityDocumentByDocType = catchAsync(async (req, res, next) => {
	const cofferId = req.user.coffer_id
	const docType = req.params.doctype
	const category = req.params.cat

	const data = await identitydocumentService.getIdentityDocumentByDocType(
		cofferId,
		category,
		docType
	)

	res.status(httpStatus.OK).json(data)
})

exports.getIdentityDocumentByDocId = catchAsync(async (req, res, next) => {
	const doc_id = req.params.doc_id

	const data = await identitydocumentService.getIdentityDocumentByDocId(
		doc_id
	)

	res.status(httpStatus.OK).json(data)
})

/**
 * Add a new identity document for a specific user.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.addIdentityDocument = catchAsync(async (req, res, next) => {
	const cofferId = req.user.coffer_id

	const data = await identitydocumentService.addIdentityDocument(
		cofferId,
		req.body,
		req.file
	)
	res.status(httpStatus.OK).json(data)
})

/**
 * Update an existing identity document by document type for a specific user and category.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.updateIdentityDocument = catchAsync(async (req, res, next) => {
	const cofferId = req.user.coffer_id
	const docType = req.params.doctype
	const category = req.params.cat

	const data = await identitydocumentService.updateIdentityDocumentByDocType(
		cofferId,
		category,
		docType,
		req.body,
		req.file
	)
	res.status(httpStatus.OK).json(data)
})

/**
 * Delete an identity document by document type for a specific user and category.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
exports.deleteIdentityDocument = catchAsync(async (req, res, next) => {
	const cofferId = req.user.coffer_id
	const docType = req.params.doctype
	const category = req.params.cat

	const data = await identitydocumentService.deleteIdentityDocumentByDocType(
		cofferId,
		category,
		docType
	)
	res.status(httpStatus.OK).json(data)
})
