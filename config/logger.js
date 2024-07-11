const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf, colorize } = format

/**
 * Custom log format that includes timestamp, log level, and message.
 */
const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`
})

/**
 * Creates a logger instance using Winston.
 * 
 * @constant {Object} logger - The logger instance configured with custom settings.
 */
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        colorize(),
        customFormat
    ),
    transports: [
        new transports.Console(), // Log to the console
        // new transports.File({ filename: 'app.log' }) // Log to a file (uncomment if needed)
    ],
})

module.exports = logger
