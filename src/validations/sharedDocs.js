const Joi = require('joi')

exports.documentShareSchema = {
	body: Joi.object()
		.keys({
			rel_id: Joi.string().required().messages({
				'string.base': 'rel_id should be a type of text',
				'string.empty': 'rel_id cannot be an empty field',
				'any.required': 'rel_id is a required field'
			}),
			rel_type: Joi.string().valid('consumer').required().messages({
				'string.base': 'rel_type should be a type of text',
				'string.empty': 'rel_type cannot be an empty field',
				'any.required': 'rel_type is a required field',
				'any.only': 'rel_type must be one of [consumer]'
			}),
			documents: Joi.array()
				.items(
					Joi.object({
						doc_id: Joi.string().required().messages({
							'string.base': 'doc_id should be a type of text',
							'string.empty': 'doc_id cannot be an empty field',
							'any.required': 'doc_id is a required field'
						}),
						doc_type: Joi.string()
							.valid('identity', 'personal')
							.required()
							.messages({
								'string.base':
									'doc_type should be a type of text',
								'string.empty':
									'doc_type cannot be an empty field',
								'any.required': 'doc_type is a required field',
								'any.only':
									'doc_type must be one of [identity, personal]'
							})
					})
				)
				.required()
				.messages({
					'array.base': 'documents should be an array',
					'array.includes':
						'documents array must include valid items',
					'any.required': 'documents is a required field'
				})
		})
		.options({ stripUnknown: true, abortEarly: true })
}
