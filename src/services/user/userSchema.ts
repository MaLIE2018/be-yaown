import mongoose, { Model } from "mongoose";
import bcrypt from "bcrypt";
import { User, Agreement } from "../../types/interfaces";
import Models from "../../services/models";

const { Schema, model } = mongoose;

interface UserModel extends Model<User> {
  checkCredentials(email: string, password: string): {} | null;
}

const userSchema = new Schema<User, UserModel>(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    img: { type: String, default: "" },
    pw: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
    active: { type: Boolean, default: false },
    verifyToken: { type: String, default: "" },
    emailToken: { type: String, default: "" },
    googleId: { type: String, default: "" },
    lastTransRefresh: { type: Date, default: new Date(2000, 0, 1) },
    agreements: [
      new Schema<Agreement>(
        {
          id: {
            type: String,
            default: "",
          },
          aspsp_id: { type: String, default: "" },
          created_at: { type: String, default: "" },
          accepted: { type: String, default: "" },
          access_valid_for_days: { type: Number },
          max_historical_days: { type: Number },
          requisition: { type: String, default: "" },
          accounts: [],
          reference: { type: String, default: "" },
          access_token: { type: String },
          token_type: { type: String },
          state: { type: String },
        },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
); //, strict: false

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();
  delete userObj.refreshToken;
  delete userObj.verifyToken;
  delete userObj.googleId;
  delete userObj.pw;
  delete userObj.__v;
  delete userObj.agreements;

  return userObj;
};

userSchema.pre("save", async function () {
  const newUser = this;

  const account = await Models.Accounts.find({
    $and: [{ cashAccountType: "cash" }, { userId: newUser._id }],
  });
  if (account.length === 0) {
    const cashAccount = new Models.Accounts();
    cashAccount.userId = newUser._id;
    cashAccount.name = "Cash";
    cashAccount.cashAccountType = "cash";
    cashAccount.currency = "EUR";
    cashAccount.balances.push({
      balanceAmount: { currency: "EUR", amount: 0 },
      referenceDate: new Date().toISOString(),
      balanceType: "closingBooked",
    });
    cashAccount.bankName = "Cash";

    await cashAccount.save();
  }

  if (newUser.isModified("pw")) {
    newUser.pw = await bcrypt.hash(newUser.pw!, 10);
  }
});

userSchema.static(
  "checkCredentials",
  async function checkCredentials(email, password) {
    const user = await await this.findOne({ email: email });
    if (user) {
      // if (!user.active) return null;
      const isMatch = await bcrypt.compare(password, user.pw!);

      if (isMatch) {
        return user;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
);

export default model("User", userSchema);
