import * as winston from 'winston'

const {NODE_ENV, LOG_LEVEL} = process.env;

const logger: winston.Logger = winston.createLogger({
    level: LOG_LEVEL || 'info',
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
})

if (NODE_ENV !== 'production') {
    const consoleLogger = new winston.transports.Console({
        format: winston.format.simple()
    })
    logger.add(consoleLogger)
}

export default logger