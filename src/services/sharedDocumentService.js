const ApiError = require('../utils/ApiError')
const logger = require('../../config/logger')
const { SharedDocument, IdentityDocument } = require('../models')
const httpStatus = require('http-status')

const extractNonExistingDocIds = async (documents, coffer_id) => {
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
	logger.info(`Successfully return non-exiting docid `)
	return nonExistingDocIds
}

exports.shareDocuments = async (coffer_id, payload) => {
	const { rel_id, rel_type, documents, relationship } = payload

	// Find non-existing document IDs
	const nonExistingDocIds = await extractNonExistingDocIds(
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

	// Share the documents
	const sharedDocuments = []
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
			const newSharedDocument = new SharedDocument({
				relationship_id: rel_id,
				doctype: doc.doc_type,
				docid: doc.doc_id,
				shared_by: coffer_id,
				shared_with: sharedWith,
				docversion: doc.docVersion || ''
			})

			await newSharedDocument.save()
			sharedDocuments.push({ doc_id: doc.doc_id })
		} else {
			sharedDocuments.push({ doc_id: doc.doc_id })
		}
	}

	logger.info(`Successfully shared document with`)
	return {
		message: 'Documents shared successfully',
		sharedDocuments: sharedDocuments
	}
}

exports.unShareDocuments = async (coffer_id, payload) => {
	const { rel_id, rel_type, documents, relationship } = payload

	// Find non-existing document IDs
	const nonExistingDocIds = await extractNonExistingDocIds(
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
	const unsharedDocuments = []
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
			unsharedDocuments.push({ doc_id: doc.doc_id })
		} else {
			unsharedDocuments.push({ doc_id: doc.doc_id, status: 'not_shared' })
		}
	}

	logger.info(`Successfully Unshared document with`)
	return {
		message: 'Documents UnShared successfully',
		unsharedDocuments: unsharedDocuments
	}
}

exports.getDocumentSharedByMe = async (coffer_id, rel_id) => {
	const projection = { _id: 0, docid: 1, doctype: 1 }
	try {
		const sharedByMeDocs = await SharedDocument.find(
			{
				shared_by: coffer_id,
				relationship_id: rel_id
			},
			projection
		)
		const byMeDocs = []
		projection = { _id: 0, doctype: 1, category: 1, content_type: 1 }
		for (const doc of sharedByMeDocs) {
			if (doc.doctype === 'identity') {
				const idoc = await IdentityDocument.findOne({ _id: doc.docid })
				byMeDocs.push(idoc)
			}
		}
		// {
		//     "docname": "pancard",
		//     "description": "ABCDE1234R",
		//     "docid": "668281c4aeac634f1a8abb33",
		//     "doctype": "identity",
		//     "country_affiliation": "citizen_primary",
		//     "url": "https://cyberitus-east1.s3.amazonaws.com/con-B105715C4BF767DE/citizen_primary-pancard?response-content-type=image%2Fpng&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJAQUBK7BVHIS6OYQ%2F20240729%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240729T100840Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=0efc46e092c8b5d72ad468030235d1b492c33998b7c2cbb42edda25dca845d55",
		//     "content_type": "image/png"
		// },

		return byMeDocs
	} catch (error) {
		console.log
		// res.status(500).send({ error: 'Failed to fetch shared documents' })
	}
}

exports.getDocumentSharedWith = async (coffer_id, rel_id) => {
	try {
		const sharedWithMeDocs = await SharedDocument.find({
			shared_with: coffer_id,
			relationship_id: rel_id
		})
		return sharedWithMeDocs
	} catch (error) {
		// res.status(500).send({ error: 'Failed to fetch shared documents' })
	}
}
