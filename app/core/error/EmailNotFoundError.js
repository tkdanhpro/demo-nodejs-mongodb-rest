const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class EmailNotFoundError extends ApplicationError {
    constructor(message) {
        super(message || 'Email not found!', ErrorCode.EMAIL_NOT_FOUND);
       
    }
}

module.exports = EmailNotFoundError
