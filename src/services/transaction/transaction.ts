import express, { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { Booked } from 'types/bankAccount';
import models from '../models';
import { getQuery } from '../../util/query';

const transactionRouter = express.Router();

//get income and expenses
transactionRouter.get('/incexp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await models.Transaction.aggregate([
      {
        $match: getQuery(req.query, req.user._id),
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
      next(createHttpError(404, { m: 'No transaction found' }));
    } else {
      res.status(200).send(transactions);
    }
  } catch (error) {
    next(error);
  }
});

//get filtered by Category Transaction
transactionRouter.get('/groupedbycategory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await models.Transaction.aggregate([
      {
        $match: getQuery(req.query, req.user._id),
      },
    ]).group({
      _id: '$category',
      total: { $sum: '$transactionAmount.amount' },
    });

    // const transactions = await models.Transaction.find(query.criteria);

    if (!transactions) {
      next(createHttpError(404, { m: 'No transaction found' }));
    } else {
      res.status(200).send(transactions);
    }
  } catch (error) {
    next(error);
  }
});

//get filtered by Date Transaction
transactionRouter.get('/groupedbydate/:interval', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let groupId: {} | string = '$bookingDate';
    //If annually then group by month
    if (req.params.interval === 'Annually') {
      groupId = { $month: '$bookingDate' };
    } else {
      groupId = { $dayOfMonth: '$bookingDate' };
    }

    const transactions = await models.Transaction.aggregate([
      {
        $match: getQuery(req.query, req.user._id),
      },
    ]).group({
      _id: groupId,
      total: { $sum: '$transactionAmount.amount' },
    });

    if (!transactions) {
      next(createHttpError(404, { m: 'No transaction found' }));
    } else {
      res.status(200).send(transactions);
    }
  } catch (error) {
    next(error);
  }
});

// Get all transactions for a specific account //accountId is here the mongodb ObjectID
transactionRouter.get('/:accountId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await models.Transaction.find({
      $and: [
        {
          accountId: req.params.accountId,
        },
        { userId: req.user._id },
      ],
    });

    if (!transactions) {
      next(createHttpError(404, { m: 'No transaction found' }));
    } else {
      res.status(200).send();
    }
  } catch (error) {
    next(error);
  }
});

//Add transaction to cash account
transactionRouter.post('/:accountId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await models.Accounts.findOneAndUpdate(
      { cashAccountType: 'cash', userId: req.user._id },
      {
        $inc: {
          'balances.0.balanceAmount.amount': req.body.transactionAmount.amount,
        },
        $set: { 'balances.0.referenceDate': new Date().toISOString() },
      }
    );
    if (!account) {
      next(createHttpError(404, { m: 'Account not found' }));
    } else {
      const newTransaction: Booked = {
        ...req.body,
        accountId: req.params.accountId,
        userId: req.user._id,
      };
      const transaction = new models.Transaction(newTransaction);
      await transaction.save();
      res.status(200).send();
    }
  } catch (error) {
    next(error);
  }
});
//Batch add transaction to account
transactionRouter.post('/:id/batchTransaction', async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error) {}
});

// delete transaction
transactionRouter.delete('/:id/transaction/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error) {}
});

export default transactionRouter;
