const httpStatus = require('http-status')
const { sharedDocumentService } = require('../../../src/services')

const { SharedDocument } = require('../../../src/models')
const ApiError = require('../../../src/utils/ApiError')

jest.mock('../../../src/services/sharedDocumentService')
jest.mock('../../../src/models/sharedDocument')

describe('shareDocuments service', () => {
	const coffer_id = 'coffer123'
	const payload = {
		rel_id: 'rel123',
		rel_type: 'consumer',
		documents: [{ doc_id: 'doc1', doc_type: 'type1', docVersion: 'v1' }],
		relationship: { acceptor_uid: 'user1', requestor_uid: 'user2' }
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	// it('should throw an error if documents do not exist', async () => {
	// 	extractNonExistingDocIds.mockResolvedValue(['doc1'])

	// 	// try {
	// 	// 	await sharedDocumentService.shareDocuments(coffer_id, payload)
	// 	// 	expect(extractNonExistingDocIds).toHaveBeenCalledWith(
	// 	// 		payload.documents,
	// 	// 		coffer_id
	// 	// 	)
	// 	// } catch (error) {
	// 	// 	console.log(error)
	// 	// }
	// 	await expect(
	// 		sharedDocumentService.shareDocuments(coffer_id, payload)
	// 	).rejects.toThrow(
	// 		new ApiError(
	// 			httpStatus.NOT_FOUND,
	// 			'Document(s) with ID(s) doc1 do not exist'
	// 		)
	// 	)
	// })

	it('should share documents with the correct recipient', async () => {
		sharedDocumentService.extractNonExistingDocIds.mockResolvedValue([])
		SharedDocument.findOne.mockResolvedValue(null)
		const saveMock = jest.fn().mockResolvedValue({})
		SharedDocument.mockImplementation(() => ({ save: saveMock }))

		await sharedDocumentService.shareDocuments(coffer_id, payload)

		expect(SharedDocument.findOne).toHaveBeenCalledWith({
			relationship_id: 'rel123',
			doctype: 'type1',
			docid: 'doc1',
			shared_by: 'coffer123',
			shared_with: 'user1',
			docversion: 'v1'
		})
		expect(saveMock).toHaveBeenCalled()
	})

	// it('should not share already shared documents', async () => {
	// 	extractNonExistingDocIds.mockResolvedValue([])
	// 	SharedDocument.findOne.mockResolvedValue({})

	// 	await sharedDocumentService.shareDocuments(coffer_id, payload)

	// 	expect(SharedDocument.findOne).toHaveBeenCalledWith({
	// 		relationship_id: 'rel123',
	// 		doctype: 'type1',
	// 		docid: 'doc1',
	// 		shared_by: 'coffer123',
	// 		shared_with: 'user1',
	// 		docversion: 'v1'
	// 	})
	// 	expect(SharedDocument.prototype.save).not.toHaveBeenCalled()
	// })
})
