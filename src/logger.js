const { createLogger, transports, format } = require('winston');

const logFormat = format.printf( ({ level, message, timestamp }) => {
  return `[${timestamp}][${level}]: ${message}`;
});

const logger = createLogger({
  transports:[
    /* uncomment below if you want to enable winston logs in terminal */
    // new transports.Console({
    //   format: format.combine(
    //     format.timestamp(), 
    //     logFormat
    //   )
    // }),
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
