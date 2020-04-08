const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class NoteNotFoundError extends ApplicationError {
    constructor(message) {
        super(message || 'Note does not found!', ErrorCode.NOTE_NOT_FOUND);
       
    }
}

module.exports = NoteNotFoundError
