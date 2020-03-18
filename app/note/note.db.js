const NoteModel = require('./note.model');

module.exports = {
    addNote: async (req, res) => {
        try {
            const user = req.user;
            const data = req.body.data;

            data.createdBy = user._id;
            data.admin = user._id;
            data.transactions = [];
            data.status = 'OPENING';
            data.totalAmount = 0;
            data.remainAmount = 0;

            const note = new NoteModel(data);
            await note.save();
            res.status(201).send({ note });

        } catch (err) {
            res.status(404).send(err);
        }

    },

    getNotes: async (req, res) => {
        try {
            const id = req.user._id;
            const notes = await NoteModel.find({status: 'OPENING'}).populate({
                path: 'users',
                match: { _id: id },
                select: 'username'
            }).exec()
            res.status(201).send({ notes });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    updateNote: async (req, res) => {

    },

    finishNote: async (req, res) => {

    }

}