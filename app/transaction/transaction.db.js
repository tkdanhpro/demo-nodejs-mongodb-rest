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
                        // t.filter({ title: 1, description: 1, status: 1, type: 1, payer: 1, createdBy: 1, created_at: 1, updated_at: 1 })
                        t.populate('payer', 'fullName picture')
                        .populate('users', 'fullName picture')
                        .populate('createdBy', 'fullName picture')
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
                    trans.remainAmount = trackingData.remain
                } else {
                    trackingData.type = 'DEBT';
                    trackingData.remain = - trackingData.payment;
                }
                userTransTrackingList.push(new UserTransTrackingModel(trackingData))

            });

            await UserTransTrackingModel.insertMany(userTransTrackingList);
            const trackings = await UserTransTrackingModel.find({ trans })
                .populate('user', 'fullName picture')
            res.status(201).send({ trans });

        } catch (err) {
            res.status(404).send(err);
        }
    },

    updateTrans: async (req, res) => {
        try {
            const data = req.body.data;
            data.createdBy = req.user._id;
            data.payer = req.user._id;
            const transId = data._id

            const ts = await TransModel.findById(transId);
            if (!ts) {
                throw new TransNotFoundError()
            }
            const note = await NoteModel.findById(data.note);
            if (!note) {
                throw new NoteNotFoundError()
            }


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
            const trans = await TransModel.findByIdAndUpdate({ _id: transId }, data, { new: true })
                    .populate('users', 'fullName picture')
                    .populate('payer', 'fullName picture')
                    .populate('createdBy', 'fullName picture');

            // delete previous tracking list
            await UserTransTrackingModel.deleteMany({note: note._id, trans: transId})

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
                .populate('payer', 'fullName picture')
                .populate('createdBy', 'fullName picture');
            if (!trans) {
                throw new TransNotFoundError()
            }
            const trackings = await UserTransTrackingModel.find({ trans: id })
                .populate('user', 'fullName picture')

            res.status(201).send({ trans, trackings })
        } catch (err) {
            res.status(404).send(err);
        }
    },

    getByNote: async (req, res) => {
        try {
            const note = req.params.noteId;

            var trans = await TransModel.find({ note })
                .populate('users', 'fullName picture')
                .populate('payer', 'fullName picture')
                .populate('createdBy', 'fullName picture');

            if (!trans) {
                throw new TransNotFoundError()
            }
            var totalPayment = 0;
            const userTrackings = await UserTransTrackingModel.find({ note, user: req.user })
            trans.forEach((tran, index, array) => {
                totalPayment += tran.value;
                const item = userTrackings.filter(tracking => tracking.trans.equals(tran._id))
                if (item) {
                    array[index].remainAmount = item[0].remain
                }
            })

            var userRemainAmount = 0;
            var userPaymentAmount = 0;
            userTrackings.forEach(tracking => {
                userRemainAmount += tracking.remain;
                userPaymentAmount += tracking.payment
            })
            var userPaidAmount = userRemainAmount + userPaymentAmount;

            res.status(201).send({ trans, userRemainAmount, userPaymentAmount, userPaidAmount, totalPayment })
        } catch (err) {
            res.status(404).send(err);
        }
    }

}
