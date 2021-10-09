"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllTransactions = exports.BUNQInstance = exports.AIPInstance = void 0;
const axios_1 = __importDefault(require("axios"));
exports.AIPInstance = axios_1.default.create({
    baseURL: process.env.AIP_URL,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: `Token ${process.env.AIP_TOKEN}`,
    },
    timeout: 20000,
});
exports.BUNQInstance = axios_1.default.create({
    baseURL: process.env.BUNQ_URL,
    headers: {
        'X-Bunq-Language': 'en_US',
        'X-Bunq-Region': 'nl_NL',
        'X-Bunq-Client-Request-Id': process.env.BUNQ_REQUEST_ID,
        'X-Bunq-Geolocation': '0 0 0 0 000',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json; charset=utf-8',
    },
});
const fetchAllTransactions = async (url, session_token, latestTransactionId, userId, accountId, dbAccountId) => {
    try {
        let next = true;
        let results = [];
        const res = await exports.BUNQInstance.get(url, { headers: { 'X-Bunq-Client-Authentication': session_token } }).then((res) => res.data);
        if (latestTransactionId === undefined) {
            res.Response.map((data) => {
                const transaction = {
                    userId: userId,
                    transactionId: data.Payment.id,
                    bankTransactionCode: '',
                    accountId: dbAccountId,
                    creditorName: data.Payment.amount?.value && Number(data.Payment.amount.value) > 0
                        ? data.Payment.alias?.display_name
                        : data.Payment.counterparty_alias?.display_name,
                    debtorAccount: {
                        iban: data.Payment.amount?.value && Number(data.Payment.amount.value) < 0
                            ? data.Payment.alias?.iban
                            : data.Payment.counterparty_alias?.iban,
                        debtorName: data.Payment.amount?.value && Number(data.Payment.amount.value) < 0
                            ? data.Payment.alias?.display_name
                            : data.Payment.counterparty_alias?.display_name,
                        logo: data.Payment.amount?.value && Number(data.Payment.amount.value) < 0
                            ? data.Payment.alias.avatar !== null
                                ? `https://api.bunq.com/v1/attachment-public/${data.Payment.alias.avatar.image[0].attachment_public_uuid}/content`
                                : ''
                            : '',
                    },
                    category: 'other',
                    remittanceInformationUnstructured: data.Payment?.description,
                    additionalInformation: '',
                    transactionAmount: {
                        amount: data.Payment.amount?.value && Number(data.Payment.amount.value),
                        currency: data.Payment.amount?.currency,
                    },
                    bookingDate: new Date(data.Payment.created.split(' ').join('T').slice(0, 27) + 'Z').toISOString(),
                    valueDate: new Date(data.Payment.updated.split(' ').join('T').slice(0, 27) + 'Z').toISOString(),
                    type: data.Payment.type,
                    sub_type: data.Payment.sub_type,
                };
                results.push(transaction);
            });
        }
        else {
            let i = 0;
            while (res.Response[i].Payment.id !== Number(latestTransactionId)) {
                const transaction = {
                    userId: userId,
                    transactionId: res.Response[i].Payment.id,
                    bankTransactionCode: '',
                    accountId: dbAccountId,
                    creditorName: res.Response[i].Payment?.amount.value && Number(res.Response[i].Payment.amount?.value) > 0
                        ? res.Response[i].Payment.alias?.display_name
                        : res.Response[i].Payment.counterparty_alias?.display_name,
                    debtorAccount: {
                        iban: res.Response[i].Payment?.amount.value && Number(res.Response[i].Payment.amount?.value) < 0
                            ? res.Response[i].Payment.alias.iban
                            : res.Response[i].Payment.counterparty_alias.iban,
                        debtorName: res.Response[i].Payment?.amount.value && Number(res.Response[i].Payment.amount?.value) < 0
                            ? res.Response[i].Payment.alias?.display_name
                            : res.Response[i].Payment.counterparty_alias?.display_name,
                        logo: res.Response[i].Payment?.amount.value && Number(res.Response[i].Payment.amount.value) < 0
                            ? res.Response[i].Payment.alias.avatar !== null
                                ? `https://api.bunq.com/v1/attachment-public/${res.Response[i].Payment.alias.avatar.image[0].attachment_public_uuid}/content`
                                : ''
                            : '',
                    },
                    category: 'other',
                    remittanceInformationUnstructured: res.Response[i].Payment?.description,
                    additionalInformation: '',
                    transactionAmount: {
                        amount: res.Response[i].Payment?.amount.value && Number(res.Response[i].Payment.amount.value),
                        currency: res.Response[i].Payment?.amount && res.Response[i].Payment.amount?.currency,
                    },
                    bookingDate: new Date(res.Response[i].Payment.created.split(' ').join('T').slice(0, 27) + 'Z').toISOString(),
                    valueDate: new Date(res.Response[i].Payment.updated.split(' ').join('T').slice(0, 27) + 'Z').toISOString(),
                    type: res.Response[i].Payment?.type,
                    sub_type: res.Response[i].Payment?.sub_type,
                };
                results.push(transaction);
                i++;
            }
            if (i === res.Response.length - 1) {
                next = true;
            }
            else {
                next = false;
            }
        }
        if (next && res.Pagination.older_url !== null) {
            return results.concat(await exports.fetchAllTransactions(res.Pagination.older_url, session_token, latestTransactionId, userId, accountId, dbAccountId));
        }
        else {
            return results;
        }
    }
    catch (error) {
        console.log(error);
    }
};
exports.fetchAllTransactions = fetchAllTransactions;
