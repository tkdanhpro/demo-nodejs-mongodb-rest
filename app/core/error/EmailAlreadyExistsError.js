const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class EmailAlreadyExistsError extends ApplicationError {
    constructor(lang, message) {
        if (lang == 'vi') {
            super(message || 'Email bạn vừa nhập đã tồn tại rùi!', ErrorCode.EMAIL_ALREADY_EXISTS);
        } else {
            super(message || 'Email already exists', ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        
    }
}

module.exports = EmailAlreadyExistsError