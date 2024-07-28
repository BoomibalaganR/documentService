const ApiError = require('../utils/ApiError')
const logger = require('../../config/logger')
const { SharedDocument } = require('../models')
const relationshipService = require('./relationshipService')
const httpStatus = require('http-status')

exports.sharedDocuments = async (coffer_id, payload) => {
	const { rel_id, rel_type, documents } = payload

	// Validate relationship
	const relationshipExists = await relationshipService.validateRelationship(
		coffer_id,
		rel_id,
		rel_type
	)

	const nonExistingDocIds = []
	const docTypeModelMap = {
		identity: IdentityDocument,
		personal: PersonalDocument
	}

	//find non-exiting doc_id
	for (const doc of documents) {
		const Model = docTypeModelMap[doc.doc_type]
		if (!Model) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				`Invalid document type: ${doc.doc_type}`
			)
		}

		const existingDoc = await Model.findById(doc.doc_id)
		if (!existingDoc) {
			nonExistingDocIds.push(doc.doc_id)
		}
	}

	if (nonExistingDocIds.length > 0) {
		return res.status(404).json({
			message: `Document(s) with ID(s) ${nonExistingDocIds.join(
				', '
			)} do not exist`
		})
	}

	// Share documents
	const sharedDocuments = []
	for (const doc of documents) {
		const existingShare = await SharedDocument.findOne({
			document: doc.doc_id,
			sharedBy: req.user.id,
			sharedWith: rel_id
		})

		if (!existingShare) {
			const sharedDocument = new SharedDocument({
				document: doc.doc_id,
				sharedBy: req.user.id,
				sharedWith: rel_id
			})

			await sharedDocument.save()
			sharedDocuments.push({ doc_id: doc.doc_id })
		} else {
			sharedDocuments.push({
				doc_id: doc.doc_id
			})
		}
	}

	return {
		message: 'Documents shared successfully',
		sharedDocument: sharedDocuments
	}
}
