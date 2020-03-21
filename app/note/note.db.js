const NoteModel = require('./note.model');
const TransModel = require('./../transaction/transaction.model')
const PermissionDeniedError = require('../core/error/PermissionDeniedError')
const MembersNoteNotEmptyError = require('../core/error/MembersNoteNotEmptyError')
const NoteNotFoundError = require('../core/error/NoteNotFoundError')

module.exports = {
    addNote: async (req, res) => {
        try {
            const user = req.user;
            const data = req.body.data;
            if (!data.members.length) 
                throw new MembersNoteNotEmptyError();
            data.createdBy = user._id;
            data.admin = user._id;
            data.transactions = [];            
            data.members = data.members.concat(user._id);

            const note = new NoteModel(data);
            await note.save();
            res.status(201).send({ note });

        } catch (err) {
            res.status(404).send(err);
        }

    },
    getById: async (req, res) => {
        try {
            
            const notes = await NoteModel.findById(req.params.id)
                .populate({
                    path:'transactions',
                    select: 'title type value -_id',
                    // populate: {path: 'payments', select: 'fullName -_id'}
                })
                .populate('members.user', 'username fullName picture -_id')
                .populate('createdBy', 'username fullName picture -_id')
                .populate('admin', 'username fullName picture -_id')
                
            res.status(201).send({ notes });
        } catch (err) {
            res.status(404).send(err);
        }

    },

    getNotes: async (req, res) => {
        try {
            const id = req.user;

            const results = await NoteModel.find({ status: 'OPENING' })
                .populate('members.user', 'username fullName picture -_id', { _id: id })
                .populate('createdBy', 'username fullName picture -_id')
                .populate('admin', 'username fullName picture -_id')
                .populate('transactions', 'title type value -_id')

                console.log(results)

            const notes = results.filter(item => item.members.length > 0)

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
            const note = await NoteModel.findOneAndUpdate({_id, admin}, data, { new: true }, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ status: "error", value: "Error, db request failed" });
                    return
                }
                
            });
            if (!note) throw new PermissionDeniedError()
            res.status(201).send({ note });
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
                    const  userPayment = t.payments.filter(p => p.user.equals(member.user));
                    if(userPayment[0]) {
                        totalPayment += userPayment[0].payment;
                        totalRemain += userPayment[0].remain;
                    }
                });
                
                member.totalPayment = totalPayment;
                member.totalRemain = totalRemain;
               
            })
            note.status = 'COMPLETED'
            await note.save()

            res.status(201).send({ note });
        } catch (err) {
            res.status(404).send(err);
        }
    }

}