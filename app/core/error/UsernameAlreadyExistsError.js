const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class UsernameAlreadyExistsError extends ApplicationError {
    constructor(lang, message) {
        if (lang == 'vi') {
            super(message || 'Tên tài khoản bạn vừa nhập đã tồn tại rùi!', ErrorCode.USERNAME_ALREADY_EXISTS);
        } else {
            super(message || 'Username already exists', ErrorCode.USERNAME_ALREADY_EXISTS);
        }
        
    }
}

module.exports = UsernameAlreadyExistsError