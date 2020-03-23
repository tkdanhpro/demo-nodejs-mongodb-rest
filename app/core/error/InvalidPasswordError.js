const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class InvalidPasswordError extends ApplicationError {
    constructor(message) {
        super(message || 'Invalid password!', ErrorCode.INVALID_PASSWORD);
    }
}

module.exports = InvalidPasswordError
