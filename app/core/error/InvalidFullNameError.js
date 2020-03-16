const ApplicationError = require('./ApplicationError');
class InvalidFullNameError extends ApplicationError {
    constructor(lang, message) {
        if (lang == 'vi') {
            super(message || 'Hãy nhập tên của bạn nhiều hơn 2 ký tự nhé!');
        } else {
            super(message || 'Full name must be greater than 2 characters!');
        }
        
    }
}

module.exports = InvalidFullNameError