const {validateIdProof, validateDoctype} = require('../utils/country')  
const ApiError = require('../utils/ApiError') 
const httpStatus = require('http-status')
/**
 * Middleware to validate request data against a given schema.
 * 
 * @param {object} schema - Validation schema
 * @returns {function} Middleware function
 */ 

exports.validate = (schema, options={}) => {
    return async (req, res, next) => {  
        
        if (req.body.tags && typeof req.body.tags === 'string') {
            try {
                req.body.tags = JSON.parse(req.body.tags)
            } catch (error) {
                return next(new Error('Invalid Array of string for tags'))
            }
        }

        const { country } = req.body 
        const doctype = req.params.doctype || req.body.doctype 
        
        // Merge custom options with context containing country and doctype
        const validationOptions = {
            ...options,
            context: { country, doctype }
        }
        
        // Validate the body with schema, passing params in the context
        const { value, error } = await schema.body.validate(req.body, validationOptions)
        if(error){
            return next(error)
        }
        
        // Update req.body with the validated values
        req.body = value

        next()
    }
}


// exports.validate = (schema) => {
//     return (req, res, next) => {
//         if (req.body.tags && typeof req.body.tags === 'string') {
//             try {
//                 req.body.tags = JSON.parse(req.body.tags)
//             } catch (error) {
//                 return next(new Error('Invalid Array of string for tags'))
//             }
//         }

//         const { error, value } = schema.body.validate(req.body)

//         if (error) {
//             return next(error)
//         }   
//         console.log('successfully validated',value)
//         const {docid, country} = req.body
//         if(docid && country === 'India'){ 
            
//             const doctype = req.params.doctype || req.body.doctype 
//             if(!validateDoctype(country, doctype)){
//                 return next(new ApiError(httpStatus.BAD_REQUEST, `Invalid doctype '${doctype}' for ${country}`))
//             }
//             if(!validateIdProof(country, doctype, docid)){
//                 return next(new ApiError(httpStatus.BAD_REQUEST, `Invalid ${doctype} ID Format for ${country}`))
//             }
//         }

//         req.body = value
//         next()
//     }
// }