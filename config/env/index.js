// Load environment variables from .env file
require('dotenv').config(); 

//default to set 'development' if NODE_ENV is not set
const env = process.env.NODE_ENV || 'development';

// object contain settings for different environments
const config = {
  
    // Development environment settings
  development: {
    // Database settings
    db: {
      uri: process.env.DB_URI_DEV, // URI for the development database
    },
    // Application settings
    app: {
      port: process.env.APP_PORT, // Port number for the application to run on
    },
    // Authentication settings
    auth: {
      secret: process.env.JWT_SECRET_DEV, // Secret key for JWT in development
      expire: process.env.JWT_EXPIRE_DEV, // Expiration time for JWT in development
    },
    // Redis settings
    redis: {
      uri: process.env.REDIS_URI_DEV, // URI for the Redis instance in development
    },   
    // cache setting
    cache: {
      expire: process.env.CACHE_EXPIRE_DEV,// cache expiration time in second
    }
  },
  
  // Production environment settings
  production: {}
  
}

// Export the configuration based on env
module.exports = config[env];
