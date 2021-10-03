import axios from 'axios';

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
    'X-Bunq-Client-Authentication': process.env.MY_SESSION_TOKEN,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'X-Bunq-Client-Signature': process.env.BUNQ_SIGNATURE ,
  },
});
