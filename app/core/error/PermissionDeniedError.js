const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class PermissionDeniedError extends ApplicationError {
    constructor(message) {
        super(message || 'Permission Denied!', ErrorCode.PERMISSION_DENIED);
       
    }
}

module.exports = PermissionDeniedError