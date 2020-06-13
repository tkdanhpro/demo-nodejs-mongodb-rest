const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class InvalidParamsError extends ApplicationError {
    constructor(message) {
        super(message || 'Invalid params error!', ErrorCode.INVALID_PARAMS_ERROR);        
    }
}

module.exports = InvalidParamsError
