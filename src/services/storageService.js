const { Storage } = require('@google-cloud/storage')
const path = require('path')

const PROJECT_ID = 'vitagist-consumer-docu'
const KEY = path.resolve(__dirname, '../../config/serviceAccountKey.json')
const BUCKET_NAME = 'gs://vitagist-consumer-docu.appspot.com'

// Function to create and return a new Storage client instance
const getStorageClient = () => {
  return new Storage({
    projectId: PROJECT_ID,
    keyFilename: KEY
  })
}

/**
 * Uploads a file to Firebase Storage.
 * 
 * @param {File} file - File object containing file data
 * @param {string} filePath - Destination path in Firebase Storage
 * @returns {Promise<string>} Signed URL of the uploaded file
 */
exports.uploadFileToFirebase = async (file, filePath) => {
  const storage = getStorageClient()
  const bucket = storage.bucket(BUCKET_NAME)
  const fileObject = bucket.file(filePath)

  // Save file to Firebase Storage
  await fileObject.save(file.buffer, {
    contentType: file.mimetype
  })

  // Get signed URL for the uploaded file
  return await this.getSignedUrl(filePath)
}

/**
 * Generates a signed URL for accessing a file in Firebase Storage.
 * 
 * @param {string} filePath - Path of the file in Firebase Storage
 * @param {object} params - Additional query parameters (optional)
 * @param {number} expires - Expiration time in milliseconds (default: 15 minutes)
 * @returns {Promise<string>} Signed URL for accessing the file
 */
exports.getSignedUrl = async (filePath, params = {}, expires = 15 * 60 * 1000) => {
  const storage = getStorageClient()
  const bucket = storage.bucket(BUCKET_NAME)
  const fileObject = bucket.file(filePath)

  // Calculate expiration time as a future timestamp
  const expirationTime = Date.now() + expires

  let options = {
    action: 'read',
    expires: expirationTime,
    queryParams: params
  }

  // Generate signed URL for file access
  const [signedUrl] = await fileObject.getSignedUrl(options)
  return signedUrl
}

/**
 * Deletes a file from Firebase Storage.
 * 
 * @param {string} filePath - Path of the file to be deleted
 * @returns {Promise<void>} Promise indicating completion of deletion
 */
exports.deleteFileFromFirebase = async (filePath) => {
  const storage = getStorageClient()
  const bucket = storage.bucket(BUCKET_NAME)
  const fileObject = bucket.file(filePath)

  // Delete file from Firebase Storage
  await fileObject.delete()
}