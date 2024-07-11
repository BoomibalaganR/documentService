const mongoose = require('mongoose')
const moment = require('moment')
const { Schema } = mongoose
const storageService = require('../services/storageService')

/**
 * IdentityDocument schema to store identity document details.
 */
const identityDocumentSchema = new Schema({
  consumer: { 
    type: String, 
    required: true, 
    immutable: true 
  },
  category: { 
    type: String, 
    required: true, 
    immutable: true 
  },
  doctype: { 
    type: String, 
    required: true,
    immutable: true 
  },
  docid: { 
    type: String, 
    required: true 
  },
  expiration_date: { 
    type: Date 
  },
  content_type: { 
    type: String, 
    required: true 
  },
  filename: { 
    type: String, 
    required: true 
  },
  filesize: { 
    type: Number, 
    required: true 
  }, 
  country: {
    type: String, 
    immutable: true 
  },
  tags: { 
    type: [String], 
    default: ["Identity"], 
    immutable: true 
  }
}, { 
  timestamps: true,
  toJSON: { 
    transform: function (doc, ret) {
      ret.id = ret._id // Rename _id to id
      delete ret._id // Remove _id field
      delete ret.__v // Remove __v field 
      ret.expiration_date = ret.expiration_date ? moment(ret.expiration_date).format('DD MMMM YYYY') : 'NA' // Format expiration_date
    }
  }
})

identityDocumentSchema.index({ consumer: 1 })

/**
 * Check if a document exists for a specific consumer, category, and document type.
 * 
 * @param {string} consumer - Consumer ID
 * @param {string} category - Document category
 * @param {string} doctype - Document type
 * @returns {boolean} True if the document exists, false otherwise
 */
identityDocumentSchema.statics.isDocumentExist = async function(consumer, category, doctype) {
  const count = await this.countDocuments({ consumer: consumer, category: category, doctype: doctype })
  return count > 0
}

/**
 * Generate the file path where the file will be stored in cloud storage.
 * 
 * @returns {string} File path
 */
identityDocumentSchema.methods.getFilePath = function() {
  return `con-${this.consumer}/${this.category}-${this.doctype}`
}

/**
 * Upload a file to cloud storage and return the URL.
 * 
 * @param {object} file - File to be uploaded
 * @returns {string} URL of the uploaded file
 */
identityDocumentSchema.methods.uploadFile = async function(file) {
  const filePath = this.getFilePath()
  const url = await storageService.uploadFileToFirebase(file, filePath)
  return url
}

/**
 * Update a file in cloud storage.
 * 
 * @param {object} file - File to be uploaded
 * @returns {string} URL of the uploaded file
 */
identityDocumentSchema.methods.updateFile = async function(file) {
  return this.uploadFile(file)
}

/**
 * Delete a file from cloud storage.
 */
identityDocumentSchema.methods.deleteFile = async function() {
  const filePath = this.getFilePath()
  await storageService.deleteFileFromFirebase(filePath)
}

/**
 * Get a signed URL to view the file.
 * 
 * @returns {string} Signed URL for viewing the file
 */
identityDocumentSchema.methods.getViewUrl = async function() {
  const filePath = this.getFilePath()
  const params = { 'ResponseContentType': this.content_type }
  const signedUrl = await storageService.getSignedUrl(filePath, params)
  return signedUrl
}

module.exports = mongoose.model('IdentityDocument', identityDocumentSchema)
