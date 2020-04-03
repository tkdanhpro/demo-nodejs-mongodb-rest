const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class TransNotFoundError extends ApplicationError {
    constructor(message) {
        super(message || 'Transaction does not found!', ErrorCode.TRANSACTION_NOT_FOUND);
       
    }
}

module.exports = TransNotFoundError
