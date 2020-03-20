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
            const trans = await TransModel.findByIdAndUpdate({ _id: req.body.data._id }, data, { new: true });

            res.status(201).send({ trans });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    completeTrans: async (req, res) => {
        try {
            const ts = await TransModel.findById(req.body.data._id);
            if (!ts) {
                throw new TransNotFoundError()
            }
            if (ts.status == 'COMPLETED') {
                throw new TransCompletedError()
            }

            const data = req.body.data;

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

            // data.remainAmount = data.value - amount*numberOfUsers;
            data.updatedBy = req.user._id;
            data.status = 'COMPLETED';
            const trans = await TransModel.findByIdAndUpdate({ _id: data._id }, data, { new: true });

            // update note
            const note = await NoteModel.findById(trans.note);
            if (!note) {
                throw new NoteNotFoundError()
            }
            if (data.type == 'OUT') {
                note.totalCashOut += data.value;
            } else {
                note.totalCashIn += data.value;
            }

            await note.save();
            res.status(201).send({ trans });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    getTrans: async (params, res) => {

    }

}