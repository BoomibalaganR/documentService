const axios = require('axios')
const logger = require('../../config/logger')

const GATEWAY_URI = 'http://127.0.0.1:8080'

/**
 * Get category data from the consumer microservice.
 * 
 * @param {string} cat - Category identifier
 * @param {string} token - Authorization token
 * @returns {Promise<object>} Category data
 */
exports.getCategory = async (cat, token) => {
    const response = await axios.get(`${GATEWAY_URI}/api/v1/consumers/citizenship/${cat}`, {
        headers: {
            'Authorization': token
        }   
    })
    logger.info(`Successfully retrieved ${cat} citizenship from consumer service`)
    return response.data
}
