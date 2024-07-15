const moment = require('moment')
const { identitydocumentService } = require('../../../src/services')
const { IdentityDocument } = require('../../../src/models/')

const httpStatus = require('http-status')

// mock the identity model
jest.mock('../../../src/models/identity')
//moc the moment
jest.mock('moment')

describe('getAllIdentityDocument service', () => {
	let consumer, category

	beforeEach(() => {
		consumer = 'f5141f9ac440cd5e'
		category = 'citizen_primary'

		// Clear all mocks before each test
		jest.clearAllMocks()
	})

	it('should fetch all identity documents and add URLs', async () => {
		// Mock data
		const mockDocs = [
			{
				_id: '1',
				consumer: consumer,
				category: category,
				_doc: {},
				getViewUrl: jest
					.fn()
					.mockResolvedValue('https://documenturl....'),
			},
			{
				_id: '2',
				consumer: consumer,
				category: category,
				_doc: {},
				getViewUrl: jest
					.fn()
					.mockResolvedValue('https://documenturl....'),
			},
		]

		// mock the find method
		IdentityDocument.find.mockResolvedValue(mockDocs)

		const result = await identitydocumentService.getAllIdentityDocument(
			consumer,
			category
		)

		// Assertions
		expect(IdentityDocument.find).toHaveBeenCalledWith({
			consumer,
			category,
		})
		expect(mockDocs[0].getViewUrl).toHaveBeenCalled()
		expect(mockDocs[1].getViewUrl).toHaveBeenCalled()
		expect(result[0]._doc.url).toBe('https://documenturl....')
		expect(result[1]._doc.url).toBe('https://documenturl....')
	})
})

describe('getIdentityDocumentByDocType service', () => {
	let consumer, category, doctype

	beforeEach(() => {
		consumer = 'f5141f9ac440cd5e'
		category = 'citizen_primary'
		doctype = 'passport'

		// Clear all mocks before each test
		jest.clearAllMocks()
	})

	it('should fetch a identity documents by doctype', async () => {
		// Mock data
		const mockDoc = {
			_id: '1',
			consumer: consumer,
			category: category,
			doctype: doctype,
			docid: '12345',
			_doc: {},
			getViewUrl: jest.fn().mockResolvedValue('https://documenturl....'),
		}

		// mock the findOne method
		IdentityDocument.findOne.mockResolvedValue(mockDoc)

		const result =
			await identitydocumentService.getIdentityDocumentByDocType(
				consumer,
				category,
				doctype
			)

		// Assertions
		expect(IdentityDocument.findOne).toHaveBeenCalledWith({
			consumer,
			category,
			doctype,
		})
		expect(mockDoc.getViewUrl).toHaveBeenCalled()
		expect(result._doc.url).toBe('https://documenturl....')
	})

	it('should handle the error when fetch unknown doctype', async () => {
		// mock the findOne method
		IdentityDocument.findOne.mockResolvedValue(null)

		//call service method and check the not found error message
		await expect(
			identitydocumentService.getIdentityDocumentByDocType(
				consumer,
				category,
				doctype
			)
		).rejects.toMatchObject({
			message: 'Given doctype is not found',
			statusCode: httpStatus.NOT_FOUND,
		})

		expect(IdentityDocument.findOne).toHaveBeenCalledWith({
			consumer,
			category,
			doctype,
		})
	})
})

describe('addIdentityDocument service', () => {
	let consumer, file

	beforeEach(() => {
		consumer = 'f5141f9ac440cd5e'
		payload = {
			category: 'citizen_primary',
			doctype: 'passport',
			expiration_date: '01-01-2025', // format 'DD-MM-YYYY'
		}
		file = {
			originalname: 'passport.img',
			size: 1024,
			mimetype: 'application/pdf',
		}

		jest.clearAllMocks()
	})

	it('should add a new identity document and upload file successfully', async () => {
		// Mock moment to return formatted date
		moment.mockReturnValue({
			format: jest.fn(() => '2025-01-01'), // Return the formatted date directly
		})

		// Mock IdentityDocument.isDocumentExist to return false (document does not exist)
		IdentityDocument.isDocumentExist.mockResolvedValue(false)

		// Mock IdentityDocument.create to return a created document
		const createdDocument = { _id: '1', ...payload }
		IdentityDocument.create.mockResolvedValue(createdDocument)

		// Mock createdDocument.uploadFile to return a URL
		const mockUrl = 'https://document-storage-url'
		createdDocument.uploadFile = jest.fn().mockResolvedValue(mockUrl)

		// Call the service method
		const result = await identitydocumentService.addIdentityDocument(
			consumer,
			payload,
			file
		)

		// Assertions
		expect(result.message).toBe(
			'Identity document created successfully under category'
		)
		expect(result.data).toEqual(createdDocument)
		expect(result.url).toBe(mockUrl)

		// Verify mocks
		expect(IdentityDocument.isDocumentExist).toHaveBeenCalledWith(
			consumer,
			payload.category,
			payload.doctype
		)
		expect(IdentityDocument.create).toHaveBeenCalledWith({
			...payload,
			consumer,
			filename: file.originalname,
			filesize: file.size,
			content_type: file.mimetype,
		})
		expect(createdDocument.uploadFile).toHaveBeenCalledWith(file)
	})

	it('should handle error when file is not provided', async () => {
		// Call the service method without providing a file
		await expect(
			identitydocumentService.addIdentityDocument(consumer, payload, null)
		).rejects.toMatchObject({
			message: 'File not provided',
			statusCode: httpStatus.BAD_REQUEST,
		})
	})

	it('should handle error when document already exists', async () => {
		// Mock moment to return formatted date
		moment.mockReturnValue({
			format: jest.fn(() => '2025-01-01'), // Return the formatted date directly
		})

		// Mock IdentityDocument.isDocumentExist to return true (document already exists)
		IdentityDocument.isDocumentExist.mockResolvedValue(true)

		// Mock updateIdentityDocumentByDocType function
		const mockUpdateFunction = jest.fn()
		identitydocumentService.updateIdentityDocumentByDocType =
			mockUpdateFunction

		// Call the service method
		await identitydocumentService.addIdentityDocument(
			consumer,
			payload,
			file
		)

		// Assertions
		expect(mockUpdateFunction).toHaveBeenCalledWith(
			consumer,
			payload.category,
			payload.doctype,
			payload,
			file
		)
		expect(mockUpdateFunction).toHaveBeenCalled()
	})

	it('should handle error during file upload', async () => {
		// Mock IdentityDocument.isDocumentExist to return false (document does not exist)
		IdentityDocument.isDocumentExist.mockResolvedValue(false)

		// Mock IdentityDocument.create to return a created document
		const createdDocument = { _id: '1', ...payload }
		IdentityDocument.create.mockResolvedValue(createdDocument)

		// Mock createdDocument.uploadFile to throw an error
		const uploadError = new Error('Upload failed')
		createdDocument.uploadFile = jest.fn().mockRejectedValue(uploadError)

		// Mock createdDocument.deleteOne
		createdDocument.deleteOne = jest.fn()

		// Call the service method and expect it to throw an ApiError
		await expect(
			identitydocumentService.addIdentityDocument(consumer, payload, file)
		).rejects.toMatchObject({
			message: 'Failed to upload file to cloud storage',
			statusCode: httpStatus.INTERNAL_SERVER_ERROR,
		})

		// Verify mocks
		expect(IdentityDocument.isDocumentExist).toHaveBeenCalledWith(
			consumer,
			payload.category,
			payload.doctype
		)
		expect(IdentityDocument.create).toHaveBeenCalledWith({
			...payload,
			consumer,
			filename: file.originalname,
			filesize: file.size,
			content_type: file.mimetype,
			expiration_date: '2025-01-01', // This is the formatted date we mocked
		})
		expect(createdDocument.uploadFile).toHaveBeenCalledWith(file)
		expect(createdDocument.deleteOne).toHaveBeenCalled()
	})
})

describe('deleteIdentityDocumentByDocType', () => {
	let consumer, cat, doctype

	beforeEach(() => {
		consumer = 'f5141f9ac440cd5e'
		cat = 'citizen_primary'
		doctype = 'passport'

		// Clear all mocks before each test
		jest.clearAllMocks()
	})

	it('should delete the identity document successfully', async () => {
		// Mock IdentityDocument.findOne to return a mock document
		const mockDoc = {
			_id: '1',
			deleteFile: jest.fn().mockResolvedValue(),
		}
		IdentityDocument.findOne.mockResolvedValue(mockDoc)

		// Mock IdentityDocument.findOneAndDelete to resolve
		IdentityDocument.findOneAndDelete.mockResolvedValue()

		// Call the service method
		const result =
			await identitydocumentService.deleteIdentityDocumentByDocType(
				consumer,
				cat,
				doctype
			)

		// Assertions
		expect(result.message).toBe('Document deleted successfully')
		expect(IdentityDocument.findOne).toHaveBeenCalledWith({
			consumer,
			category: cat,
			doctype,
		})
		expect(mockDoc.deleteFile).toHaveBeenCalled()
		expect(IdentityDocument.findOneAndDelete).toHaveBeenCalledWith({
			_id: mockDoc._id,
		})
	})

	it('should handle document not found error', async () => {
		// Mock IdentityDocument.findOne to return null (document not found)
		IdentityDocument.findOne.mockResolvedValue(null)

		// Call the service method and match not found error message
		await expect(
			identitydocumentService.deleteIdentityDocumentByDocType(
				consumer,
				cat,
				doctype
			)
		).rejects.toMatchObject({
			message: 'Given doctype is not found',
			statusCode: httpStatus.NOT_FOUND,
		})

		// Verify mocks
		expect(IdentityDocument.findOne).toHaveBeenCalledWith({
			consumer,
			category: cat,
			doctype,
		})
		expect(IdentityDocument.findOneAndDelete).not.toHaveBeenCalled()
	})

	it('should handle error deleting file from cloud storage', async () => {
		// Mock IdentityDocument.findOne to return a mock document
		const mockDoc = {
			_id: '1',
			deleteFile: jest
				.fn()
				.mockRejectedValue(new Error('Delete file error')),
		}
		IdentityDocument.findOne.mockResolvedValue(mockDoc)
		// Call the service method and match  error message
		await expect(
			identitydocumentService.deleteIdentityDocumentByDocType(
				consumer,
				cat,
				doctype
			)
		).rejects.toMatchObject({
			message: 'Failed to delete file',
			statusCode: httpStatus.INTERNAL_SERVER_ERROR,
		})

		// Verify mocks
		expect(IdentityDocument.findOne).toHaveBeenCalledWith({
			consumer,
			category: cat,
			doctype,
		})
		expect(mockDoc.deleteFile).toHaveBeenCalled()
		expect(IdentityDocument.findOneAndDelete).not.toHaveBeenCalled()
	})

	it('should handle error deleting document from database', async () => {
		// Mock IdentityDocument.findOne to return a mock document
		const mockDoc = {
			_id: '1',
			deleteFile: jest.fn().mockResolvedValue(),
		}
		IdentityDocument.findOne.mockResolvedValue(mockDoc)

		// Mock IdentityDocument.findOneAndDelete to reject
		IdentityDocument.findOneAndDelete.mockRejectedValue(
			new Error('Delete document error')
		)

		// Call the service method and match  error message
		await expect(
			identitydocumentService.deleteIdentityDocumentByDocType(
				consumer,
				cat,
				doctype
			)
		).rejects.toMatchObject({
			message: 'Delete document error',
		})

		// Verify mocks
		expect(IdentityDocument.findOne).toHaveBeenCalledWith({
			consumer,
			category: cat,
			doctype,
		})
		expect(mockDoc.deleteFile).toHaveBeenCalled()
		expect(IdentityDocument.findOneAndDelete).toHaveBeenCalledWith({
			_id: mockDoc._id,
		})
	})
})
