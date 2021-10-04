import axios from 'axios';
import { Types } from 'mongoose';
import { normalizedBooked } from 'types/bankAccount';
import { Payment } from 'types/bunq';

export const AIPInstance = axios.create({
  baseURL: process.env.AIP_URL,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
    Authorization: `Token ${process.env.AIP_TOKEN}`,
  },
  timeout: 20000,
});

export const BUNQInstance = axios.create({
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

export const fetchAllTransactions = async (
  url: string,
  session_token: string,
  results:any,
  latestTransactionId: string,
  userId: string,
  accountId: string,
  dbAccountId: string
) => {
  try {
    let next: boolean = true;
    const res = await BUNQInstance.get(url, { headers: { 'X-Bunq-Client-Authentication': session_token } }).then(
      (res) => res.data
    );
    if (latestTransactionId === undefined) {
      res.Response.map((data: { Payment: Payment }) => {
        const transaction = {
          userId: userId,
          transactionId: data.Payment.id,
          bankTransactionCode: '',
          accountId: dbAccountId,
          creditorName:
            data.Payment.amount?.value && Number(data.Payment.amount.value) > 0
              ? data.Payment.alias?.display_name
              : data.Payment.counterparty_alias?.display_name,
          debtorAccount: {
            iban:
              data.Payment.amount?.value && Number(data.Payment.amount.value) < 0
                ? data.Payment.alias?.iban
                : data.Payment.counterparty_alias?.iban,
            debtorName:
              data.Payment.amount?.value && Number(data.Payment.amount.value) < 0
                ? data.Payment.alias?.display_name
                : data.Payment.counterparty_alias?.display_name,
            logo:
              data.Payment.amount?.value && Number(data.Payment.amount.value) < 0
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
    } else {
      let i = 0;
      while (res.Response[i].Payment.id !== latestTransactionId) {
        if (res.Response.length === i + 1) {
          next = true;
        } else {
          next = false;
        }
        const transaction = {
          userId: userId,
          transactionId: res.Response[i].Payment.id,
          bankTransactionCode: '',
          accountId: dbAccountId,
          creditorName:
            res.Response[i].Payment?.amount.value && Number(res.Response[i].Payment.amount?.value) > 0
              ? res.Response[i].Payment.alias?.display_name
              : res.Response[i].Payment.counterparty_alias?.display_name,
          debtorAccount: {
            iban:
              res.Response[i].Payment?.amount.value && Number(res.Response[i].Payment.amount?.value) < 0
                ? res.Response[i].Payment.alias.iban
                : res.Response[i].Payment.counterparty_alias.iban,
            debtorName:
              res.Response[i].Payment?.amount.value && Number(res.Response[i].Payment.amount?.value) < 0
                ? res.Response[i].Payment.alias?.display_name
                : res.Response[i].Payment.counterparty_alias?.display_name,
            logo:
              res.Response[i].Payment?.amount.value && Number(res.Response[i].Payment.amount.value) < 0
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
    }
    if (next && res.Pagination.older_url !== null) {
      await fetchAllTransactions(
        res.Pagination.older_url,
        session_token,
        results,
        latestTransactionId,
        userId,
        accountId,
        dbAccountId
      );
    }
    
  } catch (error) {
    console.log(error);
  }
};
