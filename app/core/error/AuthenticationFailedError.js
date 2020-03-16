const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class AuthenticationFailedError extends ApplicationError {
    constructor(message) {
        super(message || 'Login failed! Check authentication credentials', ErrorCode.AUTHENTICATION_FAILED);
       
    }
}

module.exports = AuthenticationFailedError