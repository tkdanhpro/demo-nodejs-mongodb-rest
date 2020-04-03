const ErrorCode = require('./ErrorCode');

class ApplicationError extends Error {
    constructor(message, errorCode) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;

        this.message = message ||
            'Ops! Something went wrong. Please try again!';

        this.errorCode = errorCode || ErrorCode.APPLICATION_ERROR;
    }
};

module.exports = ApplicationError;
