"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const models_1 = __importDefault(require("../models"));
const query_1 = require("../../util/query");
const transactionRouter = express_1.default.Router();
//get income and expenses
transactionRouter.get('/incexp', async (req, res, next) => {
    try {
        const transactions = await models_1.default.Transaction.aggregate([
            {
                $match: query_1.getQuery(req.query, req.user._id),
            },
            {
                $group: {
                    _id: 'Statement',
                    expenses: {
                        $sum: {
                            $cond: [{ $lt: ['$transactionAmount.amount', 0] }, '$transactionAmount.amount', 0],
                        },
                    },
                    incomes: {
                        $sum: {
                            $cond: [{ $gte: ['$transactionAmount.amount', 0] }, '$transactionAmount.amount', 0],
                        },
                    },
                },
            },
        ]);
        // const transactions = await models.Transaction.find(query.criteria);
        if (!transactions) {
            next(http_errors_1.default(404, { m: 'No transaction found' }));
        }
        else {
            res.status(200).send(transactions);
        }
    }
    catch (error) {
        next(error);
    }
});
//get filtered by Category Transaction
transactionRouter.get('/groupedbycategory', async (req, res, next) => {
    try {
        const transactions = await models_1.default.Transaction.aggregate([
            {
                $match: query_1.getQuery(req.query, req.user._id),
            },
        ]).group({
            _id: '$category',
            total: { $sum: '$transactionAmount.amount' },
        });
        // const transactions = await models.Transaction.find(query.criteria);
        if (!transactions) {
            next(http_errors_1.default(404, { m: 'No transaction found' }));
        }
        else {
            res.status(200).send(transactions);
        }
    }
    catch (error) {
        next(error);
    }
});
//get filtered by Date Transaction
transactionRouter.get('/groupedbydate/:interval', async (req, res, next) => {
    try {
        let groupId = '$bookingDate';
        //If annually then group by month
        if (req.params.interval === 'Annually') {
            groupId = { $month: '$bookingDate' };
        }
        else {
            groupId = { $dayOfMonth: '$bookingDate' };
        }
        const transactions = await models_1.default.Transaction.aggregate([
            {
                $match: query_1.getQuery(req.query, req.user._id),
            },
        ]).group({
            _id: groupId,
            total: { $sum: '$transactionAmount.amount' },
        });
        if (!transactions) {
            next(http_errors_1.default(404, { m: 'No transaction found' }));
        }
        else {
            res.status(200).send(transactions);
        }
    }
    catch (error) {
        next(error);
    }
});
// Get all transactions for a specific account //accountId is here the mongodb ObjectID
transactionRouter.get('/:accountId', async (req, res, next) => {
    try {
        const transactions = await models_1.default.Transaction.find({
            $and: [
                {
                    accountId: req.params.accountId,
                },
                { userId: req.user._id },
            ],
        });
        if (!transactions) {
            next(http_errors_1.default(404, { m: 'No transaction found' }));
        }
        else {
            res.status(200).send();
        }
    }
    catch (error) {
        next(error);
    }
});
//Add transaction to cash account
transactionRouter.post('/:accountId', async (req, res, next) => {
    try {
        const account = await models_1.default.Accounts.findOneAndUpdate({ cashAccountType: 'cash', userId: req.user._id }, {
            $inc: {
                'balances.0.balanceAmount.amount': req.body.transactionAmount.amount,
            },
            $set: { 'balances.0.referenceDate': new Date().toISOString() },
        });
        if (!account) {
            next(http_errors_1.default(404, { m: 'Account not found' }));
        }
        else {
            const newTransaction = {
                ...req.body,
                accountId: req.params.accountId,
                userId: req.user._id,
            };
            const transaction = new models_1.default.Transaction(newTransaction);
            await transaction.save();
            res.status(200).send();
        }
    }
    catch (error) {
        next(error);
    }
});
//Batch add transaction to account
transactionRouter.post('/:id/batchTransaction', async (req, res, next) => {
    try {
    }
    catch (error) { }
});
// delete transaction
transactionRouter.delete('/:id/transaction/:id', async (req, res, next) => {
    try {
    }
    catch (error) { }
});
exports.default = transactionRouter;
