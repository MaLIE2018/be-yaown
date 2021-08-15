import { PinTanClient } from "fints";

const startDate = new Date("2021-03-12T12:00:00Z");
const endDate = new Date("2021-09-11T12:00:00Z");

const config = {
  url: "https://fints.deutsche-bank.de/",
  name: "700833581200",
  pin: "32262",
  blz: "10070024",
  debug: true,
};
const client = new PinTanClient(config);

// const config = {
//   url: "https://fints.comdirect.de/fints",
//   name: "21383750",
//   pin: "957408",
//   blz: "20041155",
//   debug: true,
// };

// const client = new PinTanClient(config);

export const getAccount = async () => {
  console.log(client);
  const dialog = await client.createDialog({
    ...config,
    productId: "fints",
    systemId: "0",
  });
  console.log(dialog.init());

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question(`Please enter the pin`, (tan: string) => {
    console.log(`PIN: ${tan}`);
    readline.close();
  });
  // dialog.init();
  // await dialog.init();
  // const accounts = await client.accounts();
  // console.info(accounts); // List of all accounts.

  // const statements = await client.statements(accounts[0], startDate, endDate);
  // console.info(statements); // List of all statements with transactions in specified date range.
};
