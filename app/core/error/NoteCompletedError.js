const ApplicationError = require('./ApplicationError');
const ErrorCode = require('./ErrorCode');

class NoteCompletedError extends ApplicationError {
    constructor(message) {
        super(message || 'Note has completed already!', ErrorCode.NOTE_COMPLETED_FOUND);
       
    }
}

module.exports = NoteCompletedError
