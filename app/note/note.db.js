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
            data.members = data.members.concat(user._id);

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
            const notes = await NoteModel.find({status: 'OPENING'})
            .populate('members', 'username fullName picture -_id', {_id: id})
            .populate('createdBy', 'username fullName picture -_id')
            .populate('admin', 'username fullName picture -_id')

            res.status(201).send({ notes });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    updateNote: async (req, res) => {
        try {
            const id = req.user._id;
            const notes = await NoteModel.aggregate(
                {
                    $lookup:
                     {
                       from: 'users',
                       localField: 'members',
                       foreignField: '_id',
                       as: 'members'
                     }
                  }
            ).find({status: 'OPENING'})
            .populate('members', 'username fullName picture -_id')
            .populate('createdBy', 'username fullName picture -_id')
            .populate('admin', 'username fullName picture -_id')
            
        

            res.status(201).send({ notes });
        } catch (err) {
            res.status(404).send(err);
        }
    },

    finishNote: async (req, res) => {

    }

}