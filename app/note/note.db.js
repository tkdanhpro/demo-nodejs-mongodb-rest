const NoteModel = require('./note.model');
const TransModel = require('./../transaction/transaction.model')
const UserNoteDetailModel = require('./../user_note_detail/user_note_detail.model')
const UserTrackingModel = require('./../user_trans_tracking/user_trans_tracking.model')
const PermissionDeniedError = require('../core/error/PermissionDeniedError')
const MembersNoteNotEmptyError = require('../core/error/MembersNoteNotEmptyError')
const NoteNotFoundError = require('../core/error/NoteNotFoundError')
const NoteCompletedError = require('../core/error/NoteCompletedError')

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    addNote: async (req, res) => {
        try {
            const user = req.user;
            const data = req.body.data;
            if (!data.members.length)
                throw new MembersNoteNotEmptyError();
            data.createdBy = user._id;
            data.admin = user._id;
            data.members = data.members.concat({ user });
            const note = new NoteModel(data);
            await note.save()
                .then(n => n.populate('members.user', 'fullName picture')
                    .populate('admin', 'fullName picture')
                    .execPopulate());

            data.members.forEach(member => new UserNoteDetailModel({ note, user: member.user}).save())        
            res.status(201).send({ note });

        } catch (err) {
            res.status(404).send(err);
        }

    },
    getById: async (req, res) => {
        try {
            const notes = await NoteModel.findById(req.params.id,
                { name: 1, description: 1, status: 1, totalCashIn: 1, totalCashOut: 1, totalRemain: 1, created_at: 1, updated_at: 1, 'members.user': 1 })
                .populate('members.user', 'fullName picture')
            // .populate('members.user', 'username fullName picture -_id')
            // .populate('createdBy', 'username fullName picture -_id')
            // .populate('admin', 'username fullName picture -_id')

            // await asyncForEach(notes, async (note, index, array) => {
            //     const transList = await TransModel.find({ note })
            //     const totalCashOut = transList.map(t => t.value).reduce((a,b) => a + b, 0)
            //     array[index].totalCashOut += totalCashOut
            // })

            res.status(201).send({ notes });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    getUserNotes: async (req, res) => {
        try {
            const _id = req.user._id;
            const notes = await NoteModel.find({ 'members.user': { '$eq': _id, '$exists': true } }
                , { name: 1, description: 1, status: 1, totalCashIn: 1, totalCashOut: 1, totalRemain: 1, created_at: 1, updated_at: 1, 'members.user': 1 })
                .populate('members.user', 'fullName picture')
                .then(results => results.filter(item => item.members.filter(m => m.user).length > 0))

            // var notes = results.filter(item => item.members.filter(m => m.user).length > 0)
            await asyncForEach(notes, async (note, index, array) => {
                const transList = await TransModel.find({ note })
                const totalCashOut = transList.map(t => t.value).reduce((a, b) => a + b, 0)
                array[index].totalCashOut += totalCashOut

                const trackingList = await UserTrackingModel.find({ note, user: req.user })

                const totalRemain = trackingList.map(t => t.remain).reduce((a, b) => a + b, 0)
                array[index].totalRemain += totalRemain
            })

            res.status(201).send({ notes });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    updateNote: async (req, res) => {
        try {
            const admin = req.user.id;
            const _id = req.body.id;
            const data = req.body.data;
            const completedNote = await NoteModel.findOne({ _id, status: 'COMPLETED' });
            if (completedNote) {
                throw new NoteCompletedError()
            }
            data.members.forEach(mem => {
                if (mem.isLeft && mem.totalPayment == 0 && mem.totalRemain == 0)
                    mem.deleted = true;
                return mem
            });

            const note = await NoteModel.findOneAndUpdate({ _id, admin }, data, { new: true })
                .then(note => note.filter(n => n)
                    .populate('members.user', 'username fullName picture')
                    .populate('admin', 'username fullName picture')
                    .execPopulate());

            if (!note) throw new PermissionDeniedError();
            res.status(201).send({ note });
        } catch (err) {
            res.status(404).send(err);
        }
    },

    changeStatus: async (req, res) => {
        try {
            const noteId = req.body.id;
            const note = await NoteModel.findById(noteId);
            if (!note) {
                throw new NoteNotFoundError();
            }

            note.status = req.body.status;
            await note.save()
                .then(n => n.populate('members.user', 'fullName picture')
                    .populate('admin', 'fullName picture')
                    .execPopulate());

            res.status(201).send({ note: note._id, status: note.status });
        } catch (err) {
            res.status(404).send(err);
        }
    },

    shareMoney: async (req, res) => {
        try {
            const noteId = req.body.data.nodeId;
            
            const note = await NoteModel.findById(noteId);
            if (!note) {
                throw new NoteNotFoundError();
            }
            note.status = 'COMPLETED';
            await note.save();
            // console.log(note._id )
            const noteDetails = await UserNoteDetailModel.find({ note: note._id })
            .populate('user', 'fullName picture');
            res.status(201).send({ note, noteDetails });
        } catch (err) {
            res.status(404).send(err);
        }
    },

    completeNote: async (req, res) => {
        try {
            const noteId = req.body.id;
            const note = await NoteModel.findById(noteId);
            if (!note) {
                throw new NoteNotFoundError();
            }
            note.members.forEach(async member => {

                const trans = await TransModel.find({
                    note: noteId,
                    deleted: false,
                    'payments.user': member.user
                });
                var totalPayment = 0;
                var totalRemain = 0;
                trans.forEach(t => {
                    const userPayment = t.payments.filter(p => p.user.equals(member.user));
                    if (userPayment[0]) {
                        totalPayment += userPayment[0].payment;
                        totalRemain += userPayment[0].remain;
                    }
                });

                member.totalPayment = totalPayment;
                member.totalRemain = totalRemain;

            })
            note.status = 'COMPLETED'
            await note.save()
                .then(n => n.populate('members.user', 'fullName picture')
                    .populate('admin', 'fullName picture')
                    .execPopulate());;

            res.status(201).send({ note });
        } catch (err) {
            res.status(404).send(err);
        }
    },

    deleteNote: async (req, res) => {
        try {
            const _id = req.body.id;
            var note = await NoteModel.findById( _id );
            if (!note) {
                throw new NoteNotFoundError()
            }
            note.status = 'CLOSED';
            await note.save();

            res.status(201).send({ deleted: true });
        } catch (err) {
            res.status(404).send(err);
        }
    },

}