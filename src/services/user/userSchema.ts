import mongoose, { Model } from "mongoose";
import bcrypt from "bcrypt";
import { User } from "types/interfaces";

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
    accounts: [{ type: Schema.Types.ObjectId, ref: "Account" }],
    refreshToken: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    googleId: { type: String, default: "" },
  },
  { timestamps: true }
); //, strict: false

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();
  delete userObj.refreshToken;
  delete userObj.pw;
  delete userObj.__v;

  return userObj;
};

userSchema.pre("save", async function () {
  const newUser = this;
  if (newUser.isModified("pw")) {
    newUser.pw = await bcrypt.hash(newUser.pw!, 10);
  }
});

userSchema.static(
  "checkCredentials",
  async function checkCredentials(email, password) {
    const user = await this.findOne({ email: email });

    if (user) {
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
