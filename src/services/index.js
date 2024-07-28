/**
 * Service module for making calls to another microservice.
 */
exports.consumerService = require('./consumerService')

/**
 * Service module for handling operations related to identity documents.
 */
exports.identitydocumentService = require('./identitydocumentService')

/**
 * Service module for handling storage operations.
 */
exports.storageService = require('./storageService')

exports.sharedDocumentService = require('./sharedDocumentService')

exports.relationshipService = require('./relationshipService')
