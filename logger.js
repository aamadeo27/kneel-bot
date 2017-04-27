const winston = require("winston")

module.exports = {
    log: new (winston.Logger)({
        transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'bot.log' })
        ]
    }).info,

    error: new (winston.Logger)({
        transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'bot.error.log' })
        ]
    }).error
}