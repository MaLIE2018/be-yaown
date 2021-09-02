import { ObjectId } from "mongoose";

export interface Account {
  resourceId: string;
  _id: string;
  iban: string;
  currency: string;
  ownerName: string;
  userId: ObjectId;
  name: string;
  product: string;
  accountId: string;
  bankName: string;
  aspspId: string;
  logo: string;
  cashAccountType: string;
  balances: Balances[];
  transactions: { booked: Booked[]; pending: Pending[] };
}

export interface Balances {
  balanceAmount: TransactionAmount;
  balanceType: string;
  referenceDate: string;
}

export interface Transaction {
  booked: any[];
  pending: any[];
}

export interface Booked {
  transactionId: string;
  debtorName?: string;
  debtorAccount?: DebtorAccount;
  transactionAmount: TransactionAmount;
  bankTransactionCode: string;
  bookingDate: Date;
  valueDate: Date;
  remittanceInformationUnstructured: string;
  category: string;
}

export interface Pending {
  transactionAmount: TransactionAmount;
  valueDate: Date;
  remittanceInformationUnstructured: string;
  category: string;
}

export interface DebtorAccount {
  iban: string;
}

export interface TransactionAmount {
  currency: string;
  amount: number;
}
