const ApplicationError = require('./ApplicationError');
class WrongEmailFormatError extends ApplicationError {
    constructor(message) {
        super(message || 'Wrong email format!');
       
    }
}

module.exports = WrongEmailFormatError
