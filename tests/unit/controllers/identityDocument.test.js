const httpMocks = require('node-mocks-http')
const { identityDocumentController } = require('../../../src/controllers') // Replace with your controller path
const { identitydocumentService } = require('../../../src/services') // Replace with your service path

jest.mock('../../../src/services/identitydocumentService')

// Import test db connection
const { clearDB, connectDB } = require('../../utils/setupDB')
const httpStatus = require('http-status')

describe('getAllIdentityDocuments Controller', () => {
	let req, res, next

	// Mock request and response object for each test
	beforeEach(() => {
		req = httpMocks.createRequest({
			user: { coffer_id: 'f5141f9ac440cd5e' },
			params: { cat: 'citizen_primary' },
		})
		res = httpMocks.createResponse()
		next = jest.fn()
	})

	// setup the test db
	beforeAll(connectDB)
	afterAll(clearDB)

	it('should fetch all identity documents', async () => {
		// Mock service function
		const mockData = [
			{ docid: 111, doctype: 'Aadhar', url: '' },
			{ docid: 222, doctype: 'passport', url: '' },
		]
		identitydocumentService.getAllIdentityDocument.mockResolvedValue(
			mockData
		)

		// Call the controller function
		await identityDocumentController.getAllIdentityDocuments(req, res, next)

		// check the response
		expect(res.statusCode).toBe(200)
		expect(res._getJSONData()).toEqual({ data: mockData })
	})

	// it('should handle errors when get all identity document', async () => {
	// 	// Mock service function to throw an error
	// 	const errorMessage = 'error fetching all identity document'
	// 	identitydocumentService.getAllIdentityDocument.mockRejectedValue(
	// 		new Error(errorMessage)
	// 	)

	// 	// Call the controller function
	// 	await identityDocumentController.getIdentityDocumentByDocType(
	// 		req,
	// 		res,
	// 		next
	// 	)
	// 	console.log(res)
	// 	// Assert the response
	// 	expect(next).toHaveBeenCalledWith(expect.any(Error)) // Ensure next is called with an error
	// 	expect(res.statusCode).not.toBe(httpStatus.OK) // Ensure status is not set to OK
	// 	expect(res._getData()).toBe('')
	// })
})

describe('getIdentityDocumentByDocType Controller', () => {
	let req, res, next

	// Mock request and response object for each test
	beforeEach(() => {
		req = httpMocks.createRequest({
			user: { coffer_id: 'f5141f9ac440cd5e' },
			params: { cat: 'citizen_primary', doctype: 'passport' },
		})
		res = httpMocks.createResponse()

		// Mock the next function
		next = jest.fn()
	})

	// setup the test db
	beforeAll(connectDB)
	afterAll(clearDB)

	it('should fetch a identity documents based on docType', async () => {
		// Mock service function
		const mockData = { docid: 222, doctype: 'passport', url: '' }

		identitydocumentService.getIdentityDocumentByDocType.mockResolvedValue(
			mockData
		)

		// Call the controller function
		await identityDocumentController.getIdentityDocumentByDocType(
			req,
			res,
			next
		)
		console.log(res._getJSONData())
		// check the response
		expect(res.statusCode).toBe(200)
		expect(res._getJSONData()).toEqual(mockData)
	})
})

describe('addIdentityDocument Controller', () => {
	let req, res, next

	/// setup the test db
	beforeAll(connectDB)
	afterAll(clearDB)

	beforeEach(() => {
		req = httpMocks.createRequest({
			user: { coffer_id: 'f5141f9ac440cd5e' },
			body: { key: 'value' },
			file: {
				originalname: 'testFile.img',
				buffer: Buffer.from('test file content'),
			},
		})
		res = httpMocks.createResponse()
		next = jest.fn()
	})

	it('should add a new identity document and return success message', async () => {
		const mockData = {
			message: 'Identity document created successfully under category',
		}
		identitydocumentService.addIdentityDocument.mockResolvedValue(mockData)

		// Call the controller function
		await identityDocumentController.addIdentityDocument(req, res, next)

		// check the response
		expect(res.statusCode).toBe(httpStatus.OK)
		expect(res._getJSONData()).toEqual(mockData)
		expect(next).not.toHaveBeenCalled()
	})

	// it('should handle errors when adding a new identity document', async () => {
	// 	const errorMessage = 'Error adding document'
	// 	identitydocumentService.addIdentityDocument.mockRejectedValue(
	// 		new Error(errorMessage)
	// 	)

	// 	await identityDocumentController.addIdentityDocument(req, res, next)

	// 	expect(next).toHaveBeenCalledWith(expect.any(Error))
	// 	expect(res.statusCode).not.toBe(httpStatus.OK)
	// 	expect(res._getData()).toBe('')
	// })
})

describe('updateIdentityDocument Controller', () => {
	let req, res, next

	// setup the test db
	beforeAll(connectDB)
	afterAll(clearDB)

	beforeEach(() => {
		req = httpMocks.createRequest({
			user: { coffer_id: 'f5141f9ac440cd5e' },
			params: { doctype: 'passport', cat: 'citzen_primary' },
			body: { docid: '123456' },
		})
		res = httpMocks.createResponse()
		next = jest.fn() // Mock next function for error handling
	})

	it('should update an identity document and return it', async () => {
		const mockData = {
			message: 'Successfully updated identity document in the database.',
			data: { docid: '123456', doctype: 'passport' },
			url: 'https://documenturl....',
		}
		identitydocumentService.updateIdentityDocumentByDocType.mockResolvedValue(
			mockData
		)

		await identityDocumentController.updateIdentityDocument(req, res, next)

		expect(res.statusCode).toBe(httpStatus.OK)
		expect(res._getJSONData()).toEqual(mockData)
	})
})
