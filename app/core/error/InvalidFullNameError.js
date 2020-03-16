const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class InvalidFullNameError extends ApplicationError {
    constructor(message) {
        super(message || 'Full name must be greater than 2 characters!', ErrorCode.INVALID_FULL_NAME);        
    }
}

module.exports = InvalidFullNameError