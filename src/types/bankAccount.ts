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
  cashAccountType: string;
  Balances: Balances[];
  Transactions: { booked: Booked[]; pending: Pending[] };
}

export interface Balances {
  balanceAmount: BalanceAmount;
  balanceType: string;
  referenceDate: Date;
}

export interface BalanceAmount {
  amount: string;
  currency: string;
}

export interface Transaction {
  booked: Booked[];
  pending: Pending[];
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
}

export interface DebtorAccount {
  iban: string;
}

export interface TransactionAmount {
  currency: string;
  amount: string;
}

export interface Pending {
  transactionAmount: TransactionAmount;
  valueDate: Date;
  remittanceInformationUnstructured: string;
}
