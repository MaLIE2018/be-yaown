import UserModel from "../services/user/userSchema";
import AccountModel from "../services/account/accountSchema";
import AssetModel from "../services/asset/assetSchema";
import TransactionModel from "../services/transaction/transactionSchema";

const Models = {
  Users: UserModel,
  Accounts: AccountModel,
  Assets: AssetModel,
  Transaction: TransactionModel,
};

export default Models;
