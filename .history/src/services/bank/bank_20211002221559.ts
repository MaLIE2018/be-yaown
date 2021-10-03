import express, { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { Agreement } from 'types/interfaces';
import { AIPInstance, BUNQInstance } from '../../util/axios';
import { nanoid } from 'nanoid';
import { cookieOptions } from 'util/cookies';
import Models from '../models';
import axios from 'axios';
import { Account, Booked } from 'types/bankAccount';
import { differenceInHours, toDate, differenceInDays } from 'date-fns';
import { sign } from '../../lib/crypto';
import { Alias, MonetaryAccount } from 'types/bunq';
import { validate as uuidValidate } from 'uuid';
const bankRouter = express.Router();

//does bank agreement already exists
bankRouter.get('/checkBank/:aspsp_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isMatch = req.user.agreements.some((agreement: Agreement) => agreement.aspsp_id === req.params.aspsp_id);
    isMatch ? res.status(204).send() : res.status(200).send();
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//get bank info
bankRouter.get('/aspsps/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bank = await AIPInstance.get(`aspsps/${req.params.id}`).then((bank) => bank);
    bank ? res.status(200).send(bank.data) : next(createError(404, { m: 'No available Banks' }));
  } catch (error) {
    next(error);
  }
});
//get all banks for country code
bankRouter.get('/:countrycode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banks = await AIPInstance.get(`aspsps/?country=${req.params.countrycode}`).then((banks) => banks);
    banks ? res.status(200).send(banks.data) : next(createError(404, { m: 'No available Banks' }));
  } catch (error) {
    console.log(error);
    next(error);
  }
});
// create Enduser Agreement
bankRouter.post('/agreements/enduser/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agreement = await AIPInstance.post(`agreements/enduser/`, {
      enduser_id: req.user._id,
      max_historical_days: 90,
      aspsp_id: `${req.body.aspsp_id}`,
    }).then((agreement) => agreement);

    if (agreement.data) {
      req.user.agreements.push(agreement.data);
      await req.user.save();
      res.status(200).send();
    } else {
      next(createError(404, { m: 'No available Banks' }));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
// create Requisition
bankRouter.post('/requisitions/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currAgreementIndex = req.user.agreements.findIndex(
      (agreement: Agreement) => agreement.aspsp_id === req.body.aspsp_id
    );
    const reference = nanoid();
    const requisition = await AIPInstance.post(`requisitions/`, {
      enduser_id: req.user._id,
      agreements: [req.user.agreements[currAgreementIndex].id],
      redirect: `${process.env.FE_URL}/wealth?status=successful-connected&id=${req.user.agreements[currAgreementIndex].aspsp_id}`,
      reference: reference,
    }).then((requisition) => requisition);

    if (requisition) {
      req.user.agreements[currAgreementIndex].requisition = requisition.data.id;
      req.user.agreements[currAgreementIndex].reference = reference;
      await req.user.save();
      res.status(200).send();
    } else {
      next(createError(500, { m: 'Generic Server Error' }));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
// get initiation Link
bankRouter.post('/initiationLink/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currAgreement = req.user.agreements.find((agreement: Agreement) => agreement.aspsp_id === req.body.aspsp_id);
    const link = await AIPInstance.post(`/requisitions/${currAgreement.requisition}/links/`, {
      aspsp_id: req.body.aspsp_id,
    }).then((link) => link);

    if (link) {
      res.status(200).send({ initiate: link.data.initiate });
    } else {
      next(createError(500, { m: 'Generic Server Error' }));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// get account ids from nordigen api
// create corresponding accounts
bankRouter.post('/requisitions/accounts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accountMap: { id: string; accountId: string }[] = [];
    //find agreement
    const currAgreementIndex = req.user.agreements.findIndex(
      (agreement: Agreement) => agreement.aspsp_id === req.body.aspsp_id
    );

    const requisitions = await AIPInstance.get(
      `requisitions/${req.user.agreements[currAgreementIndex].requisition}/`
    ).then((requisition) => requisition.data);
    if (requisitions) {
      // create a account for each retrieved account from the aspsp
      //get bank details
      const bank = await AIPInstance.get(`aspsps/${req.body.aspsp_id}`).then((bank) => bank.data);
      requisitions.accounts.forEach(async (accountId: string) => {
        //get account details
        const account = await AIPInstance.get(`accounts/${accountId}/details/`);
        if (account.data.account.name === '') {
          account.data.account.name = 'Bank Account';
        }
        const newAccountObj = {
          ...account.data.account,
          userId: req.user._id,
          accountId: accountId,
          aspspId: bank.id,
          bankName: bank.name,
          logo: bank.logo,
        };
        //create new Account
        const newAccount = new Models.Accounts(newAccountObj);
        //get balances for each account
        const balances = await AIPInstance.get(`accounts/${accountId}/balances/`);
        //add balances to newly created account
        newAccount.balances.push(...balances.data.balances);
        accountMap.push({ id: newAccount._id, accountId });
        await newAccount.save();
      });
      // write into the list of accounts of the user agreement
      req.user.agreements[currAgreementIndex].accounts.push(...accountMap);
      await req.user.save();
      res.status(200).send();
    } else {
      next(createError(500, { m: 'Generic Server Error' }));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//get transactions from bank api
//TODO handle pending transactions
bankRouter.get('/transactions', async (req, res, next) => {
  try {
    const lastRefresh = toDate(req.user.lastTransRefresh);
    if (differenceInHours(new Date(), lastRefresh) < 6) {
      res.status(429).send({ m: 'Only four times a day. Wait six hours' });
    }
    const requisitions = req.user.agreements.reduce((acc: { id: string; accountId: string }[], curr: Agreement) => {
      acc.push(...curr.accounts);
      return acc;
    }, []);
    if (requisitions.length === 0) next(createError(404, { m: 'No available accounts' }));
    // get Transactions over api
    const transactionSets = await Promise.all(
      requisitions.map(
        async (accountMap: { id: string; accountId: string }) =>
          await AIPInstance.get(`accounts/${accountMap.accountId}/transactions`).then((res) => {
            return { id: accountMap.id, ts: res.data.booked };
          })
      )
    );
    //add others as category
    const normalizedTransactions: Booked[] = [];
    transactionSets.forEach((transactionSet: { id: string; ts: Booked[] }) => {
      const transactions = transactionSet.ts.map((transaction: Booked) => {
        //TODO how to check that only new transactions are taken
        if (differenceInDays(toDate(transaction.bookingDate), lastRefresh) > 0) {
          return {
            ...transaction,
            userId: req.user._id,
            accountId: transactionSet.id,
            category: 'other',
            'transactionsAmount.amount': Number(transaction.transactionAmount.amount),
            bookingDate: toDate(transaction.bookingDate),
            valueDate: toDate(transaction.valueDate),
          };
        }
      });
      normalizedTransactions.push(...transactions);
    });
    //add transactions in bulk
    await Models.Transaction.create(normalizedTransactions);

    //only four times a day
    req.user.lastTransRefresh = new Date().toISOString();
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    next(error);
  }
});

//get balances
bankRouter.get('/balances', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let balancesSets = []
    let bunqBalancesSets = []
    const lastRefresh = toDate(req.user.lastBalRefresh);
    if (differenceInHours(new Date(), lastRefresh) < 6) {
      res.status(429).send({ m: 'Only four times a day. Wait six hours' });
    }
    const requisitions = req.user.agreements.reduce((acc: { id: string; accountId: string }[], curr: Agreement) => {
      if (curr.aspsp_id !== 'BUNQ_NE') acc.push(...curr.accounts);
      return acc;
    }, []);
    const bunqAgreement = req.user.agreements.find((agreement: Agreement) => agreement.aspsp_id === 'BUNQ_NE');
    if (requisitions.length === 0 && !bunqAgreement ) next(createError(404, { m: 'No available accounts' }));
    // get Balances over api
    balancesSets = await Promise.all(
      requisitions.map(async (accountMap: { id: string; accountId: string }) => {
        return await AIPInstance.get(`accounts/${accountMap.accountId}/transactions`).then((res) => {
          return { id: accountMap.id, bs: res.data.balances[0] };
        });
      })
    );
    // get Balances over apiBunq
    if (!bunqAgreement) {
        bunqBalancesSets = await Promise.all(
        bunqAgreement.accounts.map(async (accountMap: { id: string; accountId: string }) => {
          return await BUNQInstance.get(
            `/v1/user/${bunqAgreement.bunqUserId}/monetary-account/${accountMap.accountId}`,
            {
              headers: { 'X-Bunq-Client-Authentication': bunqAgreement.access_token },
            }
          ).then((account) => {
            let key: string = '';
            if (account.data?.MonetaryAccountBank) {
              key = 'MonetaryAccountBank';
            } else if (account.data?.MonetaryAccountJoint) {
              key = 'MonetaryAccountJoint';
            } else if (account.data?.MonetaryAccountSavings) {
              key = 'MonetaryAccountSavings';
            }
            return {
              id: accountMap.id,
              bs: {
                balanceAmount: {
                  amount: Number(account[key].balance.value),
                  currency: account[key].balance.currency,
                },
                balanceType: 'closingBooked',
              },
            };
          });
        })
      );
    }
    const balances = [...bunqBalancesSets, ...balancesSets]
    balances.forEach(async balance => {
      await Models.Accounts.findByIdAndUpdate(balance.id)
    });
    //only four times a day
    req.user.lastBalRefresh = new Date().toISOString();
  } catch (error) {}
});
//bunq
bankRouter.get('/auth/bunq', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).send({
      initiate: `https://oauth.bunq.com/auth?response_type=code&client_id=${process.env.BUNQ_CLIENT_ID}&redirect_uri=${process.env.FE_URL}/wealth?status=successful-connected-with-bunq&state=${req.user._id}`,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//get session Token
bankRouter.post('/auth/bunq/code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = await axios
      .post(
        `https://api.oauth.bunq.com/v1/token?grant_type=authorization_code&code=${req.body.code}&redirect_uri=${process.env.FE_URL}/wealth?status=successful-connected-with-bunq&client_id=${process.env.BUNQ_CLIENT_ID}&client_secret=${process.env.BUNQ_CLIENT_SECRET}`
      )
      .then((auth) => auth.data);
    //create session
    const body = { secret: 'c467c6d0c01c7c473776c15ec89eb8103bf20d3ef2894fbb6c31f95d35718169' };
    const signature = sign(body, process.env.BUNQ_CLIENT_PRIVATE_KEY);
    const session = await BUNQInstance.post('/v1/session-server', JSON.stringify(body), {
      headers: {
        'X-Bunq-Client-Authentication': process.env.BUNQ_INSTALLATION_TOKEN,
        'X-Bunq-Client-Signature': signature,
      },
    }).then((session) => session.data);
    //accountMap for agreement in User document
    const accountMap: { id: string; accountId: string }[] = [];
    //create all accounts
    const accounts = await BUNQInstance.get(`/v1/user/${session.Response[2].UserPerson.id}/monetary-account`, {
      headers: { 'X-Bunq-Client-Authentication': session.Response[1].Token.token },
    }).then((accounts) => accounts.data.Response);
    if (accounts) {
      accounts.forEach(async (account: MonetaryAccount) => {
        let key: string = '';
        if (account?.MonetaryAccountBank) {
          key = 'MonetaryAccountBank';
        } else if (account?.MonetaryAccountJoint) {
          key = 'MonetaryAccountJoint';
        } else if (account?.MonetaryAccountSavings) {
          key = 'MonetaryAccountSavings';
        }
        if (account[key].status === 'ACTIVE') {
          const newAccountObj: Account = {
            iban: account[key].alias.find((item: Alias) => item.type === 'IBAN').value,
            name: account[key].description,
            currency: account[key].currency,
            userId: req.user._id,
            accountId: account[key].id.toString(),
            savingRate: 0,
            cashAccountType: 'CACC',
            ownerName: '',
            resourceId: '',
            product: '',
            balances: [
              {
                balanceAmount: {
                  amount: Number(account[key].balance.value),
                  currency: account[key].balance.currency,
                },
                balanceType: 'closingBooked',
                referenceDate: new Date().toISOString(),
              },
            ],
            aspspId: 'BUNQ_NE',
            bankName: 'Bunq',
            logo: 'https://res.cloudinary.com/dipmax-export/image/upload/v1633196554/yaown/bunq_ovf7dw.ico',
          };
          //create new Account
          const newAccount = new Models.Accounts(newAccountObj);
          accountMap.push({ id: newAccount._id, accountId: account[key].id.toString() });
          await newAccount.save();
        }
      });
    }
    //agreement
    const agreement = {
      access_token: session.Response[1].Token.token,
      bunqUserId: session.Response[2].UserPerson.id,
      accounts: [],
      aspsp_id: 'BUNQ_NE',
    };
    agreement.accounts.push(...accountMap);
    req.user.agreements.push(agreement);
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    next(error);
    console.log(error);
  }
});

export default bankRouter;
