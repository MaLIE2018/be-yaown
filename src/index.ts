let banks = require("fints-institute-db");
import { getAccount } from "./util/hbci/index";

let dsgv = banks.filter((bank: any) => {
  if (bank.name && bank.name.toLowerCase().includes("deutsche")) {
    return bank;
  }
});

// console.log(dsgv);

getAccount();
