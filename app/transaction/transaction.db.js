const TransModel = require('./transaction.model');
const NoteModel = require('./../note/note.model');
const NoteNotFoundError = require('./../core/error/NoteNotFoundError')
const TransNotFoundError = require('./../core/error/TransNotFoundError')
const TransCompletedError = require('./../core/error/TransCompletedError')

module.exports = {
    addTrans: async (req, res) => {
        try {
            const note = await NoteModel.findById(req.body.data.note);
            if (!note) {
                throw new NoteNotFoundError()
            }

            const data = req.body.data;

            data.createdBy = req.user._id;

            data.payments.forEach(element => {
                if (element.user == data.payer) {
                    element.type = 'CASHBACK';
                    element.remain = data.value - element.payment;
                } else {
                    element.type = 'DEBT';
                    element.remain = - element.payment;
                }
                return element;
            });

            const isIncludesPayer = data.payments.filter(p => p.user == data.payer).length > 0;

            if (!isIncludesPayer) {
                const payerUser = {
                    user: data.payer,
                    payment: 0,
                    remain: data.value,
                    type: 'CASHBACK'
                }
                data.payments = data.payments.concat(payerUser)
            }

            const trans = new TransModel(data);
            await trans.save();

            // update note
            if (data.type == 'OUT') {
                note.totalCashOut += data.value;
            } else {
                note.totalCashIn += data.value;
            }

            note.transactions = note.transactions.concat(trans)
            await note.save();
            res.status(201).send({ trans });

        } catch (err) {
            res.status(404).send(err);
        }
    },


    updateTrans: async (req, res) => {
        try {
            const ts = await TransModel.findById(req.body.data._id);
            if (!ts) {
                throw new TransNotFoundError()
            }

            const data = req.body.data;
            data.updatedBy = req.user._id;

            data.payments.forEach(element => {
                if (element.user == data.payer) {
                    element.type = 'CASHBACK';
                    element.remain = data.value - element.payment;
                } else {
                    element.type = 'DEBT';
                    element.remain = - element.payment;
                }
                return element;
            });

            const isIncludesPayer = data.payments.filter(p => p.user == data.payer).length > 0;

            if (!isIncludesPayer) {
                const payerUser = {
                    user: data.payer,
                    payment: 0,
                    remain: data.value,
                    type: 'CASHBACK'
                }
                data.payments = data.payments.concat(payerUser)
            }

            const trans = await TransModel.findByIdAndUpdate({ _id: req.body.data._id }, data, { new: true });

            res.status(201).send({ trans });

        } catch (err) {
            res.status(404).send(err);
        }
    },
    
    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const trans = await TransModel.findById(id);
            if (!trans) {
                throw new TransNotFoundError()
            }
            res.status(201).send({trans})
        } catch (err) {
            res.status(404).send(err);
        }
    },

    getByNote: async (req, res) => {
        try {
            const noteId = req.params.noteId;
            console.log(noteId)
            const trans = await TransModel.find({note: noteId});
            
            if (!trans) {
                throw new TransNotFoundError()
            }
            res.status(201).send({trans})
        } catch (err) {
            res.status(404).send(err);
        }
    }

}