const TransModel = require('./transaction.model')
const NoteModel = require('./../note/note.model')
const UserTransTrackingModel = require('../user_trans_tracking/user_trans_tracking.model')
const NoteNotFoundError = require('./../core/error/NoteNotFoundError')
const TransNotFoundError = require('./../core/error/TransNotFoundError')

module.exports = {
    addTrans: async (req, res) => {
        try {
            const note = await NoteModel.findById(req.body.data.note);
            if (!note) {
                throw new NoteNotFoundError()
            }

            const data = req.body.data;

            data.createdBy = req.user._id;
            data.payer = req.user._id;

            // check if payments contains payer or not
            const isIncludedPayer = data.payments.filter(p => p.user == data.payer).length > 0;
            if (!isIncludedPayer) {
                data.payments.push({
                    user: data.payer,
                    amount: 0
                })
            }

            // set data for transactions
            const users = data.payments.map(payment => payment.user);
            data.users = users;

            const trans = new TransModel(data);
            await trans.save()
                .then(t => {
                    t.populate('users', 'username fullName picture')
                        .populate('payer', 'username fullName picture')
                        .populate('createdBy', 'username fullName picture')
                        .execPopulate()
                });

            // add user trans tracking
            var userTransTrackingList = [];

            data.payments.forEach(payment => {
                var trackingData = {
                    user: payment.user,
                    note,
                    trans,
                    payment: payment.amount
                }
                if (payment.user == data.payer) {
                    trackingData.type = 'CASHBACK';
                    trackingData.remain = data.value - trackingData.payment;
                } else {
                    trackingData.type = 'DEBT';
                    trackingData.remain = - trackingData.payment;
                }
                userTransTrackingList.push(new UserTransTrackingModel(trackingData))

            });


            await UserTransTrackingModel.insertMany(userTransTrackingList);

            // if (data.type == 'OUT') {
            //     note.totalCashOut += data.value;
            // } else {
            //     note.totalCashIn += data.value;
            // }

            // note.transactions = note.transactions.concat(trans)
            // await note.save();

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
            const note = await NoteModel.findById(req.body.data.note);
            if (!note) {
                throw new NoteNotFoundError()
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

            // update note
            // data.payments.forEach(element => {
            //     note.members.map(m => {
            //         if (m.user.equals(element.user)) {
            //             m.totalPayment += element.payment;
            //             m.totalRemain += element.remain;
            //         }
            //         return m;
            //     });
            // })
            // await note.save();


            const trans = await TransModel.findByIdAndUpdate({ _id: req.body.data._id }, data, { new: true })
                .then(t => {
                    t.populate('payments.user', 'username fullName picture')
                        .populate('payer', 'username fullName picture')
                        .populate('createdBy', 'username fullName picture')
                });

            res.status(201).send({ trans });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const trans = await TransModel.findById(id,
                { title: 1, description: 1, status: 1, type: 1, payer: 1, createdBy: 1, created_at: 1, updated_at: 1 })
                .populate('payer', 'username fullName picture')
                .populate('createdBy', 'username fullName picture');
            if (!trans) {
                throw new TransNotFoundError()
            }
            const trackings = await UserTransTrackingModel.find({ trans: id })
                .populate('user', 'username fullName picture')

            res.status(201).send({ trans, trackings })
        } catch (err) {
            res.status(404).send(err);
        }
    },

    getByNote: async (req, res) => {
        try {
            const note = req.params.noteId;
            var trans = await TransModel.find({ note })
                .populate('users', 'username fullName picture')
                .populate('payer', 'username fullName picture')
                .populate('createdBy', 'username fullName picture');

            if (!trans) {
                throw new TransNotFoundError()
            }

            trans.forEach(async tran => {
                tran.remainAmount = 0;
                const tran_id = tran;
                await UserTransTrackingModel.findOne({ note, user: req.user, trans: tran_id },
                    (err, data) => {
                        var remainAmount = 0;
                        if (data) {
                            remainAmount = data.remain;
                        }
                        tran.remainAmount = remainAmount

                    })
                console.log('data ', tran)
                return tran
            })


            res.status(201).send({ trans })
        } catch (err) {
            res.status(404).send(err);
        }
    }

}
