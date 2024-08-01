const { sharedDocumentService } = require('../../../src/services')
const { SharedDocument, IdentityDocument } = require('../../../src/models')

const ApiError = require('../../../src/utils/ApiError')
const httpStatus = require('http-status')

jest.mock('../../../src/models/sharedDocument')
jest.mock('../../../src/models/identity')

describe('shareDocuments service', () => {
	const coffer_id = '12345'
	const payload = {
		rel_id: 'rel_id_1',
		rel_type: 'consumer',
		documents: [
			{ doc_type: 'type1', doc_id: 'doc_id_1', docVersion: 'v1' },
			{ doc_type: 'type2', doc_id: 'doc_id_2', docVersion: 'v2' }
		],
		relationship: {
			acceptor_uid: 'acceptor_id',
			requestor_uid: 'requestor_id'
		}
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should share documents successfully', async () => {
		// Mocking extractNonExistingDocIds to return an empty array
		sharedDocumentService.extractNonExistingDocIds = jest
			.fn()
			.mockResolvedValue([])

		// Mocking findOne to return null (no existing share)
		SharedDocument.findOne.mockResolvedValue(null)

		const result = await sharedDocumentService.shareDocuments(
			coffer_id,
			payload
		)
		expect(result).toEqual({
			message: 'Documents shared successfully'
		})

		expect(SharedDocument.findOne).toHaveBeenCalledTimes(2)
	})

	it('should throw an error if document IDs do not exist', async () => {
		// Mocking extractNonExistingDocIds to return non-existing document IDs
		sharedDocumentService.extractNonExistingDocIds = jest
			.fn()
			.mockResolvedValue(['doc_id_3'])

		await expect(
			sharedDocumentService.shareDocuments(coffer_id, payload)
		).rejects.toThrow(
			new ApiError(
				httpStatus.NOT_FOUND,
				`Document(s) with ID(s) doc_id_3 do not exist`
			)
		)

		expect(SharedDocument.findOne).not.toHaveBeenCalled()
	})
})

describe('unshareDocuments service', () => {
	const coffer_id = '12345'
	const payload = {
		rel_id: 'rel_id_1',
		rel_type: 'consumer',
		documents: [
			{ doc_type: 'type1', doc_id: 'doc_id_1', docVersion: 'v1' },
			{ doc_type: 'type2', doc_id: 'doc_id_2', docVersion: 'v2' }
		],
		relationship: {
			acceptor_uid: 'acceptor_id',
			requestor_uid: 'requestor_id'
		}
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should share documents successfully', async () => {
		// Mocking extractNonExistingDocIds to return an empty array
		sharedDocumentService.extractNonExistingDocIds = jest
			.fn()
			.mockResolvedValue([])

		// Mocking findOne to return null (no existing share)
		SharedDocument.findOne.mockResolvedValue(null)

		const result = await sharedDocumentService.unShareDocuments(
			coffer_id,
			payload
		)
		expect(result).toEqual({
			message: 'Documents UnShared successfully'
		})

		expect(SharedDocument.findOne).toHaveBeenCalledTimes(2)
	})

	it('should throw an error if document IDs do not exist', async () => {
		// Mocking extractNonExistingDocIds to return non-existing document IDs
		sharedDocumentService.extractNonExistingDocIds = jest
			.fn()
			.mockResolvedValue(['doc_id_3'])

		await expect(
			sharedDocumentService.unShareDocuments(coffer_id, payload)
		).rejects.toThrow(
			new ApiError(
				httpStatus.NOT_FOUND,
				`Document(s) with ID(s) doc_id_3 do not exist`
			)
		)

		expect(SharedDocument.findOne).not.toHaveBeenCalled()
	})
})

describe('getDocumentSharedByMe service', () => {
	const coffer_id = '12345'
	const rel_id = 'rel_id_1'

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return documents shared by me', async () => {
		// Mock data
		const sharedByMeDocs = [
			{ docid: 'doc_id_1', doctype: 'identity' },
			{ docid: 'doc_id_2', doctype: 'identity' }
		]

		const identityDoc = {
			_id: 'doc_id_1',
			doctype: 'passport',
			description: 'Passport description',
			category: 'country_category',
			getViewUrl: jest.fn().mockResolvedValue('http://example.com/view'),
			content_type: 'application/pdf'
		}

		// Mocking SharedDocument.find to return this (for chaining)
		SharedDocument.find.mockReturnValue({
			select: jest.fn().mockResolvedValue(sharedByMeDocs)
		})

		// Mocking IdentityDocument.findOne to return identity document
		IdentityDocument.findOne.mockResolvedValue(identityDoc)

		const result = await sharedDocumentService.getDocumentSharedByMe(
			coffer_id,
			rel_id
		)

		expect(result).toEqual([
			{
				docname: 'passport',
				description: 'Passport description',
				docid: 'doc_id_1',
				doctype: 'identity',
				country_affiliation: 'country_category',
				url: 'http://example.com/view',
				content_type: 'application/pdf'
			},
			{
				docname: 'passport',
				description: 'Passport description',
				docid: 'doc_id_1',
				doctype: 'identity',
				country_affiliation: 'country_category',
				url: 'http://example.com/view',
				content_type: 'application/pdf'
			}
		])

		expect(SharedDocument.find).toHaveBeenCalledWith({
			shared_by: coffer_id,
			relationship_id: rel_id
		})

		expect(IdentityDocument.findOne).toHaveBeenCalledWith({
			_id: 'doc_id_1'
		})
		expect(identityDoc.getViewUrl).toHaveBeenCalled()
	})

	it('should throw an error if fetching documents fails', async () => {
		// Mocking SharedDocument.find to throw an error
		SharedDocument.find.mockReturnValue({
			select: jest.fn().mockRejectedValue(new Error('Database error'))
		})

		await expect(
			sharedDocumentService.getDocumentSharedByMe(coffer_id, rel_id)
		).rejects.toThrow(
			new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				'Failed to fetch shareByMe documents'
			)
		)

		expect(SharedDocument.find).toHaveBeenCalledWith({
			shared_by: coffer_id,
			relationship_id: rel_id
		})

		expect(SharedDocument.find().select).toHaveBeenCalledWith(
			'docid doctype -_id'
		)
		// expect(ApiError).toHaveBeenCalledWith(
		// 	httpStatus.INTERNAL_SERVER_ERROR,
		// 	'Failed to fetch shareByMe documents'
		// )
	})
})

describe('getDocumentSharedByWithMe service', () => {
	const coffer_id = '12345'
	const rel_id = 'rel_id_1'

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return documents shared withme', async () => {
		// Mock data
		const sharedWithMeDocs = [
			{ docid: 'doc_id_1', doctype: 'identity' },
			{ docid: 'doc_id_2', doctype: 'identity' }
		]

		const identityDoc = {
			_id: 'doc_id_1',
			doctype: 'passport',
			description: 'Passport description',
			category: 'country_category',
			getViewUrl: jest.fn().mockResolvedValue('http://example.com/view'),
			content_type: 'application/pdf'
		}

		// Mocking SharedDocument.find to return this (for chaining)
		SharedDocument.find.mockReturnValue({
			select: jest.fn().mockResolvedValue(sharedWithMeDocs)
		})

		// Mocking IdentityDocument.findOne to return identity document
		IdentityDocument.findOne.mockResolvedValue(identityDoc)

		const result = await sharedDocumentService.getDocumentSharedWith(
			coffer_id,
			rel_id
		)

		expect(result).toEqual([
			{
				docname: 'passport',
				description: 'Passport description',
				docid: 'doc_id_1',
				doctype: 'identity',
				country_affiliation: 'country_category',
				url: 'http://example.com/view',
				content_type: 'application/pdf'
			},
			{
				docname: 'passport',
				description: 'Passport description',
				docid: 'doc_id_1',
				doctype: 'identity',
				country_affiliation: 'country_category',
				url: 'http://example.com/view',
				content_type: 'application/pdf'
			}
		])

		expect(SharedDocument.find).toHaveBeenCalledWith({
			shared_with: coffer_id,
			relationship_id: rel_id
		})

		expect(IdentityDocument.findOne).toHaveBeenCalledWith({
			_id: 'doc_id_1'
		})
		expect(identityDoc.getViewUrl).toHaveBeenCalled()
	})

	it('should throw an error if fetching documents fails', async () => {
		// Mocking SharedDocument.find to throw an error
		SharedDocument.find.mockReturnValue({
			select: jest.fn().mockRejectedValue(new Error('Database error'))
		})

		await expect(
			sharedDocumentService.getDocumentSharedByMe(coffer_id, rel_id)
		).rejects.toThrow(
			new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				'Failed to fetch shareByMe documents'
			)
		)

		expect(SharedDocument.find).toHaveBeenCalledWith({
			shared_by: coffer_id,
			relationship_id: rel_id
		})

		expect(SharedDocument.find().select).toHaveBeenCalledWith(
			'docid doctype -_id'
		)
	})
})
