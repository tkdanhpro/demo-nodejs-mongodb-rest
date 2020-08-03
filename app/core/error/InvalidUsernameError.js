const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class InvalidUsernameError extends ApplicationError {
    constructor(message) {
        super(message || 'Invalid username!', ErrorCode.INVALID_USERNAME);
    }
}

module.exports = InvalidUsernameError
