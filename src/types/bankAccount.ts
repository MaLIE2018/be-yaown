import { ObjectId, Schema } from "mongoose";

export interface Account {
  resourceId: string;
  _id?: string;
  iban: string;
  currency: string;
  ownerName: string;
  savingRate: number;
  userId: ObjectId;
  name: string;
  product: string;
  accountId: string;
  bankName: string;
  aspspId: string;
  logo: string;
  cashAccountType: string;
  balances: Balances[];
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
  debtorAccount?: DebtorAccount;
  transactionAmount: TransactionAmount;
  bankTransactionCode: string;
  debtorName?:string;
  creditorName:string;
  bookingDate: Date;
  valueDate: Date;
  remittanceInformationUnstructured: string;
  additionalInformation: string,
  type: string,
  sub_type: string,
  category: string;
  userId: Schema.Types.ObjectId;
  accountId:Schema.Types.ObjectId;
}

export interface Pending {
  transactionAmount: TransactionAmount;
  valueDate: Date;
  remittanceInformationUnstructured: string;
  category: string;
}

export interface DebtorAccount {
  iban: string;
  debtorName: string;
  logo: string
}

export interface TransactionAmount {
  currency: string;
  amount: number;
}
