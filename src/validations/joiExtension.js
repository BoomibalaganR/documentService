const { validateIdProof, validateDocType } = require('../utils/country');


// Extension for validating document ID (docId)
exports.validDocIdExtension = (joi) => ({
    type: 'string', // Extending Joi's string type
    base: joi.string(), // Base type is string
    messages: {
        'string.invalidDocId': '{{#label}} is not a valid ID', // Error message for invalid document ID
        'string.invalidDocType': '{{#label}} is not a valid document type' // Error message for invalid document type
    },
    rules: {
        validDocId: {
            method() {
                return this.$_addRule('validDocId') // Add custom rule validDocId
            },
            validate(value, helpers) {
                const { context } = helpers.prefs // Get context from validation preferences
                const { country, doctype } = context // Extract country and doctype from context

                // First validate the document type
                if (!validateDocType(country, doctype)) {
                    // Create an error for invalid document type
                    const error = helpers.error('string.invalidDocType')
                    error.local.label = 'docType' // Set the error label to docType, because default label is docid
                    error.path[0] = 'docType' // Set the error path to docType, because default path is docid
                    return error // Return the error
                }

                // If document type is valid, then validate the document ID
                if (!validateIdProof(country, doctype, value)) {
                    return helpers.error('string.invalidDocId') // Return error if document ID is invalid
                }

                return value // Return the value if it passes the validation
            }
        }
    }
})


// Extension for validating document type (docType)
exports.validDocTypeExtension = (joi) => ({
    type: 'string', // Extending Joi's string type
    base: joi.string(), // Base type is string
    messages: {
        'string.invalidDocType': '{{#label}} is not a valid document type' // Error message for invalid document type
    },
    rules: {
        validDocType: {
            method() {
                return this.$_addRule('validDocType') // Add custom rule validDocType
            },
            validate(value, helpers) {
                const { context } = helpers.prefs // Get context from validation preferences
                const { country } = context // Extract country from context

                // Validate the document type
                if (!validateDocType(country, value)) {
                    return helpers.error('string.invalidDocType') // Return error if document type is invalid
                }

                return value // Return the value if it passes the validation
            }
        }
    }
})
