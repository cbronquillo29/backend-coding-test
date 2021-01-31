const { createLogger, transports, format } = require('winston');

const logFormat = format.printf( ({ level, message, timestamp }) => {
  return `[${timestamp}][${level}]: ${message}`;
});

const logger = createLogger({
  transports:[
    new transports.Console({
      format: format.combine(
        format.timestamp(), 
        logFormat
      )
    }),
    new transports.File({
      filename: './logs/debug.log',
      format: format.combine(
        format.timestamp(), 
        logFormat
      )
    }),
  ]
});



module.exports = logger;
