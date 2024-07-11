const { validDocIdExtension, validDocTypeExtension } = require('./joiExtension') // Import custom Joi extensions for docId and docType validation
const dateExtension = require('@joi/date') // Import Joi date extension

const Joi = require('joi').extend(validDocIdExtension, validDocTypeExtension, dateExtension) // Extend Joi with custom and date extensions


/**
 * Joi schema to validate request body for adding identity documents.
 * Includes validation for required fields and custom validations.
 */
exports.addIdentitydocs = {
    body: Joi.object().keys({
        doctype: Joi.string()
            .required()
            .validDocType() // Custom validation for doctype
            .messages({
                'string.base': 'Document Type must be a string', // Error message if doctype is not a string
                'string.empty': 'Document Type is required', // Error message if doctype is empty
                'any.required': 'Document Type is required' // Error message if doctype is missing
            }),
        docid: Joi.string()
            .required()
            .validDocId() // Custom validation for docid
            .messages({
                'string.base': 'Document ID must be a string', // Error message if docid is not a string
                'string.empty': 'Document ID is required', // Error message if docid is empty
                'any.required': 'Document ID is required' // Error message if docid is missing
            }),
        filename: Joi.string().required().messages({
            'string.base': 'Filename must be a string', // Error message if filename is not a string
            'string.empty': 'Filename is required', // Error message if filename is empty
            'any.required': 'Filename is required' // Error message if filename is missing
        }),
        content_type: Joi.string().required().messages({
            'string.base': 'Content Type must be a string', // Error message if content_type is not a string
            'string.empty': 'Content Type is required', // Error message if content_type is empty
            'any.required': 'Content Type is required' // Error message if content_type is missing
        }),
        category: Joi.string().required().messages({
            'string.base': 'Category must be a string', // Error message if category is not a string
            'string.empty': 'Category is required', // Error message if category is empty
            'any.required': 'Category is required' // Error message if category is missing
        }),
        country: Joi.string()
            .required()
            .messages({
                'string.base': 'Country must be a string', // Error message if country is not a string
                'string.empty': 'Country is required', // Error message if country is empty
                'any.required': 'Country is required'  // Error message if country is missing
            }),
        tags: Joi.array()
            .items(Joi.string().valid('Identity').messages({
                'any.only': 'Tags must be one "Identity"' // Error message if tag is not "Identity"
            }))
            .length(1) // Ensure there is exactly one tag
            .required()
            .messages({
                'array.base': 'Tags must be an array', // Error message if tags is not an array
                'array.includes': 'Tags must include only one element - "Identity"', // Error message if tags do not include "Identity"
                'array.length': 'Tags must include only one element - "Identity"', // Error message if there is more than one tag
                'any.required': 'Tags are required' // Error message if tags are missing
            }),
        expiration_date: Joi.date()
            .format('DD-MM-YYYY') // Validate date format
            .min('now') // Ensure date is in the future
            .optional()
            .messages({
                'date.format': 'Expiration date must be in the format "DD-MM-YYYY"', // Error message if date format is wrong
                'date.min': 'Expiration date must be a future date in the format "DD-MM-YYYY"', // Error message if date is not in the future
            })
    }).options({ stripUnknown: true, abortEarly: true }) 
}


/**
 * Joi schema to validate request body for updating identity documents.
 * Allows optional fields for updating specific document attributes.
 */
exports.updateIdentitydocs = {
    body: Joi.object({
        docid: Joi.string()
            .optional()
            .validDocId() // Custom validation for docid if provided
            .messages({
                'string.base': 'Document ID must be a string' // Error message if docid is not a string
            }),
        doctype: Joi.string().optional().messages({
            'string.base': 'Document Type must be a string' // Error message if doctype is not a string
        }),
        filename: Joi.string().optional().messages({
            'string.base': 'Filename must be a string' // Error message if filename is not a string
        }),
        content_type: Joi.string().optional().messages({
            'string.base': 'Content Type must be a string' // Error message if content_type is not a string
        }),
        category: Joi.string().optional().messages({
            'string.base': 'Category must be a string' // Error message if category is not a string
        }),
        country: Joi.string().optional().messages({
            'string.base': 'Country must be a string' // Error message if country is not a string
        }),
        expiration_date: Joi.date()
            .format('DD-MM-YYYY') // Validate date format
            .min('now') // Ensure date is in the future
            .optional()
            .messages({
                'date.format': 'Expiration date must be in the format "DD-MM-YYYY"', // Error message if date format is wrong
                'date.min': 'Expiration date must be a future date in the format "DD-MM-YYYY"', // Error message if date is not in the future
            })
    }).options({ stripUnknown: true, abortEarly: true }) // Remove unknown fields and continue validation after first error
}

