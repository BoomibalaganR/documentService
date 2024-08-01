const ApiError = require('../utils/ApiError')
const logger = require('../../config/logger')
const { SharedDocument, IdentityDocument } = require('../models')
const httpStatus = require('http-status')

exports.extractNonExistingDocIds = async (documents, coffer_id) => {
	const nonExistingDocIds = []
	const docTypeModelMap = {
		identity: IdentityDocument
		// personal: PersonalDocument
	}

	for (const doc of documents) {
		const DocumentModel = docTypeModelMap[doc.doc_type]
		if (!DocumentModel) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				`Invalid document type: ${doc.doc_type}`
			)
		}

		const existingDoc = await DocumentModel.findOne({
			_id: doc.doc_id,
			consumer: coffer_id
		})
		if (!existingDoc) {
			nonExistingDocIds.push(doc.doc_id)
		}
	}
	logger.info(`Successfully extract non-exiting docid `)
	return nonExistingDocIds
}

exports.shareDocuments = async (coffer_id, payload) => {
	const { rel_id, rel_type, documents, relationship } = payload

	// Find non-existing document IDs
	const nonExistingDocIds = await this.extractNonExistingDocIds(
		documents,
		coffer_id
	)
	// console.log(nonExistingDocIds)
	if (nonExistingDocIds.length > 0) {
		throw new ApiError(
			httpStatus.NOT_FOUND,
			`Document(s) with ID(s) ${nonExistingDocIds.join(
				', '
			)} do not exist`
		)
	}

	// Determine the recipient of the shared documents
	let sharedWith = ''
	if (rel_type === 'consumer') {
		sharedWith = relationship.acceptor_uid
		if (sharedWith === coffer_id) {
			sharedWith = relationship.requestor_uid
		}
	}

	// Share the documents
	for (const doc of documents) {
		const existingShare = await SharedDocument.findOne({
			relationship_id: rel_id,
			doctype: doc.doc_type,
			docid: doc.doc_id,
			shared_by: coffer_id,
			shared_with: sharedWith,
			docversion: doc.docVersion || ''
		})

		if (!existingShare) {
			const newSharedDocument = await SharedDocument.create({
				relationship_id: rel_id,
				doctype: doc.doc_type,
				docid: doc.doc_id,
				shared_by: coffer_id,
				shared_with: sharedWith,
				docversion: doc.docVersion || ''
			})

			// await newSharedDocument.save()
		}
	}

	logger.info(`Successfully shared document with`)
	return {
		message: 'Documents shared successfully'
	}
}

exports.unShareDocuments = async (coffer_id, payload) => {
	const { rel_id, rel_type, documents, relationship } = payload

	// Find non-existing document IDs
	const nonExistingDocIds = await this.extractNonExistingDocIds(
		documents,
		coffer_id
	)
	console.log(nonExistingDocIds)
	if (nonExistingDocIds.length > 0) {
		throw new ApiError(
			httpStatus.NOT_FOUND,
			`Document(s) with ID(s) ${nonExistingDocIds.join(
				', '
			)} do not exist`
		)
	}

	// Determine the recipient of the shared documents
	let sharedWith = ''
	if (rel_type === 'consumer') {
		sharedWith = relationship.acceptor_uid
		if (sharedWith === coffer_id) {
			sharedWith = relationship.requestor_uid
		}
	}

	// Unshare the documents
	for (const doc of documents) {
		const existingShare = await SharedDocument.findOne({
			relationship_id: rel_id,
			doctype: doc.doc_type,
			docid: doc.doc_id,
			shared_by: coffer_id,
			shared_with: sharedWith,
			docversion: doc.docVersion || ''
		})

		if (existingShare) {
			await SharedDocument.deleteOne({
				relationship_id: rel_id,
				doctype: doc.doc_type,
				docid: doc.doc_id,
				shared_by: coffer_id,
				shared_with: sharedWith,
				docversion: doc.docVersion || ''
			})
		}
	}

	logger.info(`Successfully Unshared document with`)
	return {
		message: 'Documents UnShared successfully'
	}
}

exports.getDocumentSharedByMe = async (coffer_id, rel_id) => {
	try {
		const sharedByMeDocs = await SharedDocument.find({
			shared_by: coffer_id,
			relationship_id: rel_id
		}).select('docid doctype -_id')

		let byMeDocs = []
		for (const doc of sharedByMeDocs) {
			if (doc.doctype === 'identity') {
				const idoc = await IdentityDocument.findOne({ _id: doc.docid })

				byMeDocs.push({
					docname: idoc.doctype,
					description: idoc.description || '',
					docid: idoc._id,
					doctype: 'identity',
					country_affiliation: idoc.category,
					url: await idoc.getViewUrl(),
					content_type: idoc.content_type
				})
			} else if (doc.doctype === 'personal') {
				// const pdoc = await PersonalDocument.findOne({ _id: doc.docid })
				// byMeDocs.push({
				// 	docname: pdoc.name,
				// 	description: pdoc.description || '',
				// 	docid: pdoc._id,
				// 	category: pdoc.category,
				// 	doctype: 'personal',
				// 	country_affiliation: pdoc.category,
				// 	filename: pdoc.filename,
				// 	url: await pdoc.getViewUrl(),
				// 	content_type: pdoc.content_type,
				// 	added_encryption: false
				// })
			}
		}
		return byMeDocs
	} catch (error) {
		console.log(error)
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			'Failed to fetch shareByMe documents'
		)
	}
}

exports.getDocumentSharedWith = async (coffer_id, rel_id) => {
	try {
		const sharedWithMeDocs = await SharedDocument.find({
			shared_with: coffer_id,
			relationship_id: rel_id
		}).select('docid doctype -_id')

		let withMeDocs = []
		for (const doc of sharedWithMeDocs) {
			if (doc.doctype === 'identity') {
				const idoc = await IdentityDocument.findOne({ _id: doc.docid })

				withMeDocs.push({
					docname: idoc.doctype,
					description: idoc.description || '',
					docid: idoc._id,
					doctype: 'identity',
					country_affiliation: idoc.category,
					url: await idoc.getViewUrl(),
					content_type: idoc.content_type
				})
			} else if (doc.doctype === 'personal') {
				// const pdoc = await PersonalDocument.findOne({ _id: doc.docid })
				// withMeDocs.push({
				// 	docname: pdoc.name,
				// 	description: pdoc.description || '',
				// 	docid: pdoc._id,
				// 	category: pdoc.category,
				// 	doctype: 'personal',
				// 	country_affiliation: pdoc.category,
				// 	filename: pdoc.filename,
				// 	url: await pdoc.getViewUrl(),
				// 	content_type: pdoc.content_type,
				// 	added_encryption: false
				// })
			}
		}
		return withMeDocs
	} catch (error) {
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			'Failed to fetch shareWithMe documents'
		)
	}
}
