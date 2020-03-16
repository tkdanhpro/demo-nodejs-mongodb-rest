const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class InvalidFullNameError extends ApplicationError {
    constructor(message) {
        super(message || 'Invalid full name!', ErrorCode.INVALID_FULL_NAME);        
    }
}

module.exports = InvalidFullNameError