"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const axios_1 = require("../../util/axios");
const nanoid_1 = require("nanoid");
const models_1 = __importDefault(require("../models"));
const axios_2 = __importDefault(require("axios"));
const date_fns_1 = require("date-fns");
const crypto_1 = require("../../lib/crypto");
const bankRouter = express_1.default.Router();
//does bank agreement already exists
bankRouter.get('/checkBank/:aspsp_id', async (req, res, next) => {
    try {
        const isMatch = req.user.agreements.some((agreement) => agreement.aspsp_id === req.params.aspsp_id);
        isMatch ? res.status(204).send() : res.status(200).send();
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
//get bank info
bankRouter.get('/aspsps/:id', async (req, res, next) => {
    try {
        const bank = await axios_1.AIPInstance.get(`/aspsps/${req.params.id}`).then((bank) => bank);
        bank ? res.status(200).send(bank.data) : next(http_errors_1.default(404, { m: 'No available Banks' }));
    }
    catch (error) {
        next(error);
    }
});
//get all banks for country code
bankRouter.get('/selection/:countrycode', async (req, res, next) => {
    try {
        const banks = await axios_1.AIPInstance.get(`/aspsps/?country=${req.params.countrycode}`).then((banks) => banks);
        banks ? res.status(200).send(banks.data) : next(http_errors_1.default(404, { m: 'No available Banks' }));
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
// create Enduser Agreement
bankRouter.post('/agreements/enduser/', async (req, res, next) => {
    try {
        const agreement = await axios_1.AIPInstance.post(`/agreements/enduser/`, {
            enduser_id: req.user._id,
            max_historical_days: 90,
            aspsp_id: `${req.body.aspsp_id}`,
        }).then((agreement) => agreement);
        if (agreement.data) {
            req.user.agreements.push(agreement.data);
            await req.user.save();
            res.status(200).send();
        }
        else {
            next(http_errors_1.default(404, { m: 'No available Banks' }));
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
// create Requisition
bankRouter.post('/requisitions/', async (req, res, next) => {
    try {
        const currAgreementIndex = req.user.agreements.findIndex((agreement) => agreement.aspsp_id === req.body.aspsp_id);
        const reference = nanoid_1.nanoid();
        const requisition = await axios_1.AIPInstance.post(`/requisitions/`, {
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
        }
        else {
            next(http_errors_1.default(500, { m: 'Generic Server Error' }));
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
// get initiation Link
bankRouter.post('/initiationLink/', async (req, res, next) => {
    try {
        const currAgreement = req.user.agreements.find((agreement) => agreement.aspsp_id === req.body.aspsp_id);
        const link = await axios_1.AIPInstance.post(`/requisitions/${currAgreement.requisition}/links/`, {
            aspsp_id: req.body.aspsp_id,
        }).then((link) => link);
        if (link) {
            res.status(200).send({ initiate: link.data.initiate });
        }
        else {
            next(http_errors_1.default(500, { m: 'Generic Server Error' }));
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
// get account ids from nordigen api
// create corresponding accounts
bankRouter.post('/requisitions/accounts', async (req, res, next) => {
    try {
        const accountMap = [];
        //find agreement
        const currAgreementIndex = req.user.agreements.findIndex((agreement) => agreement.aspsp_id === req.body.aspsp_id);
        const requisitions = await axios_1.AIPInstance.get(`/requisitions/${req.user.agreements[currAgreementIndex].requisition}/`).then((requisition) => requisition.data);
        if (requisitions) {
            // create a account for each retrieved account from the aspsp
            //get bank details
            const bank = await axios_1.AIPInstance.get(`/aspsps/${req.body.aspsp_id}`).then((bank) => bank.data);
            requisitions.accounts.forEach(async (accountId) => {
                //get account details
                const account = await axios_1.AIPInstance.get(`/accounts/${accountId}/details/`);
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
                const newAccount = new models_1.default.Accounts(newAccountObj);
                //get balances for each account
                const balances = await axios_1.AIPInstance.get(`/accounts/${accountId}/balances/`);
                //add balances to newly created account
                newAccount.balances.push(...balances.data.balances);
                accountMap.push({ id: newAccount._id, accountId });
                await newAccount.save();
            });
            // write into the list of accounts of the user agreement
            req.user.agreements[currAgreementIndex].accounts.push(...accountMap);
            await req.user.save();
            res.status(200).send();
        }
        else {
            next(http_errors_1.default(500, { m: 'Generic Server Error' }));
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
//get transactions from bank api
//TODO handle pending transactions
bankRouter.get('/transactions', async (req, res, next) => {
    try {
        let transactionSets = [];
        let bunqTransactionSets = [];
        const lastRefresh = date_fns_1.toDate(req.user.lastTransRefresh);
        if (date_fns_1.differenceInHours(new Date(), lastRefresh) < 6) {
            const rest = 6 - Number(date_fns_1.differenceInHours(new Date(), lastRefresh));
            next(http_errors_1.default(429, { m: `${rest}` }));
        }
        else {
            // other then bunq accounts
            const accounts = req.user.agreements.reduce((acc, curr) => {
                if (curr.aspsp_id !== 'BUNQ_NE')
                    acc.push(...curr.accounts);
                return acc;
            }, []);
            //bunq accounts
            const bunqAgreement = req.user.agreements.find((agreement) => agreement.aspsp_id === 'BUNQ_NE');
            if (accounts.length === 0 && !bunqAgreement)
                next(http_errors_1.default(404, { m: 'No available accounts' }));
            //get Transactions over api
            await Promise.all(accounts.map(async (accountMap) => await axios_1.AIPInstance.get(`/accounts/${accountMap.accountId}/transactions`).then((res) => {
                return { id: accountMap.id, ts: res.data.transactions.booked };
            }))).then((results) => transactionSets.push(...results));
            //add others as category
            transactionSets
                .reduce(async (acc, transactionSet) => {
                const collection = await acc;
                const latestTransaction = await models_1.default.Transaction.find({ accountId: transactionSet.id })
                    .sort({ _id: 1 })
                    .limit(1);
                if (latestTransaction[0]?.transactionId !== undefined && transactionSet.ts.length > 0) {
                    // add new trans to transToAdd
                    let i = 0;
                    while (transactionSet.ts[i].transactionId !== latestTransaction[0].transactionId) {
                        const transaction = {
                            userId: req.user._id,
                            transactionId: transactionSet.ts[i].transactionId,
                            bankTransactionCode: transactionSet.ts[i]?.bankTransactionCode
                                ? transactionSet.ts[i].bankTransactionCode
                                : '',
                            accountId: transactionSet.id,
                            creditorName: transactionSet.ts[i]?.creditorName ? transactionSet.ts[i].creditorName : '',
                            debtorAccount: {
                                iban: transactionSet.ts[i]?.debtorAccount?.iban ? transactionSet.ts[i].debtorAccount.iban : '',
                                debtorName: transactionSet.ts[i]?.debtorName ? transactionSet.ts[i].debtorName : '',
                                logo: '',
                            },
                            category: 'other',
                            remittanceInformationUnstructured: transactionSet.ts[i].remittanceInformationUnstructured,
                            additionalInformation: transactionSet.ts[i]?.additionalInformation
                                ? transactionSet.ts[i].additionalInformation
                                : '',
                            transactionAmount: {
                                amount: Number(transactionSet.ts[i].transactionAmount.amount),
                                currency: transactionSet.ts[i]?.transactionAmount.currency,
                            },
                            bookingDate: new Date(transactionSet.ts[i].bookingDate).toISOString(),
                            valueDate: new Date(transactionSet.ts[i].valueDate).toISOString(),
                            type: Number(transactionSet.ts[i].transactionAmount.amount) < 0 ? 'PAYMENT' : '',
                            sub_type: '',
                        };
                        collection.push(transaction);
                        i++;
                    }
                }
                else if (transactionSet.ts.length > 0) {
                    //add all transactions to normalizedTransactions
                    const transactions = transactionSet.ts.map((transaction) => {
                        return {
                            userId: req.user._id,
                            transactionId: transaction.transactionId,
                            bankTransactionCode: transaction?.bankTransactionCode ? transaction.bankTransactionCode : '',
                            accountId: transactionSet.id,
                            creditorName: transaction?.creditorName ? transaction.creditorName : '',
                            debtorAccount: {
                                iban: transaction?.debtorAccount?.iban ? transaction.debtorAccount.iban : '',
                                debtorName: transaction?.debtorName ? transaction.debtorName : '',
                                logo: '',
                            },
                            category: 'other',
                            remittanceInformationUnstructured: transaction.remittanceInformationUnstructured,
                            additionalInformation: transaction?.additionalInformation ? transaction.additionalInformation : '',
                            transactionAmount: {
                                amount: Number(transaction.transactionAmount.amount),
                                currency: transaction?.transactionAmount.currency,
                            },
                            bookingDate: new Date(transaction.bookingDate).toISOString(),
                            valueDate: new Date(transaction.valueDate).toISOString(),
                            type: Number(transaction.transactionAmount.amount) < 0 ? 'PAYMENT' : 'EBA_SCT',
                            sub_type: '',
                        };
                    });
                    collection.push(...transactions);
                }
                return await collection;
            }, [])
                .then(async (results) => {
                await models_1.default.Transaction.create(results);
            });
            // bunq
            if (bunqAgreement) {
                bunqAgreement.accounts.reduce(async (acc, accountSet) => {
                    const results = await acc;
                    const latestTransaction = await models_1.default.Transaction.find({ accountId: accountSet.id }).sort({ _id: 1 }).limit(1);
                    const inter = await axios_1.fetchAllTransactions(`/v1/user/${bunqAgreement.bunqUserId}/monetary-account/${accountSet.accountId}/payment?count=200`, bunqAgreement.access_token, latestTransaction[0]?.transactionId, req.user._id, accountSet.accountId, accountSet.id);
                    return [...results, ...inter];
                }, []).then(async (results) => {
                    await models_1.default.Transaction.create(results);
                });
            }
            //only four times a day
            req.user.lastTransRefresh = new Date().toISOString();
            await req.user.save();
        }
        res.status(200).send();
    }
    catch (error) {
        next(error);
    }
});
//get balances
bankRouter.get('/balances', async (req, res, next) => {
    try {
        let balancesSets = [];
        let bunqBalancesSets = [];
        const lastRefresh = date_fns_1.toDate(req.user.lastBalRefresh);
        if (date_fns_1.differenceInHours(new Date(), lastRefresh) < 6) {
            const rest = 6 - Number(date_fns_1.differenceInHours(new Date(), lastRefresh));
            next(http_errors_1.default(429, { m: rest }));
        }
        else {
            const requisitions = req.user.agreements.reduce((acc, curr) => {
                if (curr.aspsp_id !== 'BUNQ_NE')
                    acc.push(...curr.accounts);
                return acc;
            }, []);
            const bunqAgreement = req.user.agreements.find((agreement) => agreement.aspsp_id === 'BUNQ_NE');
            if (requisitions.length === 0 && !bunqAgreement)
                next(http_errors_1.default(404, { m: 'No available accounts' }));
            // get Balances over api
            balancesSets = await Promise.all(requisitions.map(async (accountMap) => {
                return await axios_1.AIPInstance.get(`/accounts/${accountMap.accountId}/balances`).then((res) => {
                    return { id: accountMap.id, bs: res.data.balances[0] };
                });
            }));
            // get Balances over apiBunq
            if (bunqAgreement) {
                bunqBalancesSets = await Promise.all(bunqAgreement.accounts.map(async (accountMap) => {
                    return await axios_1.BUNQInstance.get(`/v1/user/${bunqAgreement.bunqUserId}/monetary-account/${accountMap.accountId}`, {
                        headers: { 'X-Bunq-Client-Authentication': bunqAgreement.access_token },
                    }).then((account) => {
                        let key = '';
                        if (account.data.Response[0]?.MonetaryAccountBank) {
                            key = 'MonetaryAccountBank';
                        }
                        else if (account.data.Response[0]?.MonetaryAccountJoint) {
                            key = 'MonetaryAccountJoint';
                        }
                        else if (account.data.Response[0]?.MonetaryAccountSavings) {
                            key = 'MonetaryAccountSavings';
                        }
                        return {
                            id: accountMap.id,
                            bs: {
                                balanceAmount: {
                                    amount: Number(account.data.Response[0][key].balance.value),
                                    currency: account.data.Response[0][key].balance.currency,
                                },
                                balanceType: 'closingBooked',
                                referenceDate: new Date().toISOString(),
                            },
                        };
                    });
                }));
            }
            const balances = [...bunqBalancesSets, ...balancesSets];
            balances.forEach(async (balance) => {
                const account = await models_1.default.Accounts.findByIdAndUpdate(balance.id, { $set: { balances: [balance.bs] } });
            });
            //only four times a day
            req.user.lastBalRefresh = new Date().toISOString();
            req.user.save();
            res.status(200).send();
        }
    }
    catch (error) {
        next(error);
        console.log(error);
    }
});
//bunq
bankRouter.get('/auth/bunq', async (req, res, next) => {
    try {
        res.status(200).send({
            initiate: `https://oauth.bunq.com/auth?response_type=code&client_id=${process.env.BUNQ_CLIENT_ID}&redirect_uri=${process.env.FE_URL}/wealth?status=successful-connected-with-bunq&state=${req.user._id}`,
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
//get session Token
bankRouter.post('/auth/bunq/code', async (req, res, next) => {
    try {
        const auth = await axios_2.default
            .post(`https://api.oauth.bunq.com/v1/token?grant_type=authorization_code&code=${req.body.code}&redirect_uri=${process.env.FE_URL}/wealth?status=successful-connected-with-bunq&client_id=${process.env.BUNQ_CLIENT_ID}&client_secret=${process.env.BUNQ_CLIENT_SECRET}`)
            .then((auth) => auth.data);
        //create session
        const body = { secret: 'c467c6d0c01c7c473776c15ec89eb8103bf20d3ef2894fbb6c31f95d35718169' };
        const signature = crypto_1.sign(body, process.env.BUNQ_CLIENT_PRIVATE_KEY);
        const session = await axios_1.BUNQInstance.post('/v1/session-server', JSON.stringify(body), {
            headers: {
                'X-Bunq-Client-Authentication': process.env.BUNQ_INSTALLATION_TOKEN,
                'X-Bunq-Client-Signature': signature,
            },
        }).then((session) => session.data);
        //accountMap for agreement in User document
        const accountMap = [];
        //create all accounts
        const accounts = await axios_1.BUNQInstance.get(`/v1/user/${session.Response[2].UserPerson.id}/monetary-account`, {
            headers: { 'X-Bunq-Client-Authentication': session.Response[1].Token.token },
        }).then((accounts) => accounts.data.Response);
        if (accounts) {
            accounts.forEach(async (account) => {
                let key = '';
                if (account?.MonetaryAccountBank) {
                    key = 'MonetaryAccountBank';
                }
                else if (account?.MonetaryAccountJoint) {
                    key = 'MonetaryAccountJoint';
                }
                else if (account?.MonetaryAccountSavings) {
                    key = 'MonetaryAccountSavings';
                }
                if (account[key].status === 'ACTIVE') {
                    const newAccountObj = {
                        iban: account[key].alias.find((item) => item.type === 'IBAN').value,
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
                        logo: process.env.BUNQ_URL +
                            `/v1/attachment-public/${account[key].avatar.image.attachment_public_uuid}/content`,
                    };
                    //create new Account
                    const newAccount = new models_1.default.Accounts(newAccountObj);
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
    }
    catch (error) {
        next(error);
        console.log(error);
    }
});
exports.default = bankRouter;
