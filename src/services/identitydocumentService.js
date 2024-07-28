const ApiError = require('../utils/ApiError')
const logger = require('../../config/logger')
const { IdentityDocument } = require('../models')

const httpStatus = require('http-status')
const moment = require('moment')

/**
 * Retrieve all identity documents for a specific consumer and category.
 * Adds a URL to each document.
 *
 * @param {string} consumer - Consumer identifier
 * @param {string} category - Category identifier
 * @returns {Promise<Array>} Array of identity documents
 */
exports.getAllIdentityDocument = async (consumer, category) => {
	const idocs = await IdentityDocument.find({
		consumer: consumer,
		category: category
	})

	// Iterate through each document and add URL
	await Promise.all(
		idocs.map(async idoc => {
			const url = await idoc.getViewUrl()
			idoc._doc.url = url
		})
	)

	return idocs
}

/**
 * Retrieve an identity document by document type for a specific consumer and category.
 * Adds a URL to the document.
 *
 * @param {string} consumer - Consumer identifier
 * @param {string} cat - Category identifier
 * @param {string} doctype - Document type identifier
 * @returns {Promise<object>} Identity document
 * @throws {ApiError} If the document with given document type is not found
 */
exports.getIdentityDocumentByDocType = async (consumer, cat, doctype) => {
	const idoc = await IdentityDocument.findOne({
		consumer: consumer,
		category: cat,
		doctype: doctype
	})
	if (!idoc) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Given doctype is not found')
	}

	// Get the signed URL
	const url = await idoc.getViewUrl()
	idoc._doc.url = url
	logger.info('Successfully return identity document.')
	return idoc
}

// exports.getIdentityDocumentByDocId = async doc_id => {
// 	const idoc = await IdentityDocument.findById(doc_id)
// 	if (!idoc) {
// 		throw new ApiError(httpStatus.NOT_FOUND, 'Document not found')
// 	}

// 	// Get the signed URL
// 	const url = await idoc.getViewUrl()
// 	idoc._doc.url = url
// 	logger.info('Successfully return identity document.')
// 	return idoc
// }

/**
 * Add an identity document for a specific consumer.
 *
 * @param {string} consumer - Consumer identifier
 * @param {object} payload - Identity document data
 * @param {File} file - File to upload
 * @returns {Promise<object>} Confirmation message, added data, and file URL
 * @throws {ApiError} If file is not provided or upload fails
 */
exports.addIdentityDocument = async (consumer, payload, file) => {
	logger.info('Attempting to add identity document.')

	// Check if file is provided
	if (!file) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'File not provided')
	}

	const { category, doctype, expiration_date } = payload

	// Format expiration date
	payload.expiration_date = moment(expiration_date, 'DD-MM-YYYY').format(
		'YYYY-MM-DD'
	)
	console.log(payload)

	// payload.expiration_date = IdentityDocument.toParseDate(expiration_date)
	// Add additional file information into payload
	payload.consumer = consumer
	payload.filename = file.originalname
	payload.filesize = file.size
	payload.content_type = file.mimetype

	// Check if document already exists
	if (await IdentityDocument.isDocumentExist(consumer, category, doctype)) {
		logger.info('Identity document already exists, updating the document.')
		await this.updateIdentityDocumentByDocType(
			consumer,
			category,
			doctype,
			payload,
			file
		)
	} else {
		// Create the identity document in the database
		const createdDocument = await IdentityDocument.create(payload)
		logger.info('Successfully added identity document to the database.')

		// Upload file and handle potential rollback
		try {
			const url = await createdDocument.uploadFile(file)
			logger.info('Successfully uploaded file to cloud storage.')
			return {
				message:
					'Identity document created successfully under category',
				data: createdDocument,
				url: url
			}
		} catch (uploadError) {
			logger.error('Error uploading file to cloud storage:', uploadError)
			await createdDocument.deleteOne() // Roll back the created document
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				'Failed to upload file to cloud storage'
			)
		}
	}
	return { message: 'Identity document created successfully under category' }
}

/**
 * Update an identity document by document type for a specific consumer and category.
 *
 * @param {string} consumer - Consumer identifier
 * @param {string} category - Category identifier
 * @param {string} doctype - Document type identifier
 * @param {object} payload - Updated identity document data
 * @param {File} file - File to update
 * @returns {Promise<object>} Confirmation message, updated data, and file URL
 * @throws {ApiError} If given document type is not found or update fails
 */
exports.updateIdentityDocumentByDocType = async (
	consumer,
	category,
	doctype,
	payload,
	file
) => {
	// Retrieve the original document
	const originalDocument = await IdentityDocument.findOne({
		consumer: consumer,
		category: category,
		doctype: doctype
	})
	if (!originalDocument) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Given docType Not Found')
	}

	// Update the document in the database
	const updatedDocument = await IdentityDocument.findOneAndUpdate(
		{ consumer: consumer, category: category, doctype: doctype },
		{ $set: payload },
		{ new: true, runValidators: true } // Return the updated document
	)

	// Format expiration date
	payload.expiration_date = moment(
		payload.expiration_date,
		'DD-MM-YYYY'
	).format('YYYY-MM-DD')

	if (file) {
		// Add additional file information into payload
		payload.consumer = consumer
		payload.filename = file.originalname
		payload.filesize = file.size
		payload.content_type = file.mimetype

		// Update file and handle potential rollback
		try {
			const url = await updatedDocument.updateFile(file)
			logger.info('Successfully updated identity document in the cloud.')
		} catch (uploadError) {
			logger.error('Error updating file in cloud storage:', uploadError)
			await IdentityDocument.findOneAndUpdate(
				{ _id: originalDocument._id }, // Roll back the updated document
				originalDocument._doc,
				{ new: true, runValidators: true }
			)
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				'Failed to update file in cloud storage'
			)
		}
	}
	return {
		message: 'Successfully updated identity document in the database.',
		data: updatedDocument,
		url: await updatedDocument.getViewUrl()
	}
}

/**
 * Delete an identity document by document type for a specific consumer and category.
 *
 * @param {string} consumer - Consumer identifier
 * @param {string} cat - Category identifier
 * @param {string} doctype - Document type identifier
 * @returns {Promise<object>} Confirmation message
 * @throws {ApiError} If given document type is not found or delete operation fails
 */
exports.deleteIdentityDocumentByDocType = async (consumer, cat, doctype) => {
	// Find the document first
	const idoc = await IdentityDocument.findOne({
		consumer,
		category: cat,
		doctype: doctype
	})

	if (!idoc) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Given doctype is not found')
	}

	try {
		await idoc.deleteFile()
		logger.info('Document deleted successfully from the cloud.')
	} catch (error) {
		logger.error('Error deleting file from cloud storage:', error)
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			'Failed to delete file'
		)
	}

	// Delete the document from the database
	await IdentityDocument.findOneAndDelete({ _id: idoc._id })
	logger.info('Document deleted successfully from the database.')

	return { message: 'Document deleted successfully' }
}
