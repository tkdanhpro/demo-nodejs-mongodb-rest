const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class TransCompletedError extends ApplicationError {
    constructor(message) {
        super(message || 'Transaction has completed already!', ErrorCode.TRANSACTION_COMPLETED);
       
    }
}

module.exports = TransCompletedError