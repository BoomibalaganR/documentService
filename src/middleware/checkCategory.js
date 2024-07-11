const { consumerService } = require('../services')
const catchAsync = require('../utils/catchAsync')

/**
 * Middleware to check and add category data to the request body.
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.checkCategory = catchAsync(async (req, res, next) => { 
  const category = req.params.cat
  const authorizationHeader = req.headers['authorization']
  
  // Fetch category data using the consumer service
  const categoryData = await consumerService.getCategory(category, authorizationHeader)
  
  // Add category index and country to request body
  req.body.category = categoryData.index 
  req.body.country = categoryData.country 
  
  next()
})
