import { ObjectId } from "bson";

interface Match {
  bookingDate: {};
  accountId: ObjectId;
  userId: ObjectId;
}

export const getQuery = (query, userId: string): Match => {
  let match = {
    bookingDate: {},
    accountId: new ObjectId(),
    userId: new ObjectId(userId),
  };
  // BookingDate: three cases:  no date, exact date, range
  if (query?.bookingDate) {
    switch (query?.bookingDate.length) {
      case 1:
        match.bookingDate = new Date(query.bookingDate[0]);
        break;
      case 2:
        match.bookingDate = {
          $gt: new Date(query.bookingDate[0]),
          $lt: new Date(query.bookingDate[1]),
        };
    }
  } else {
    delete match.bookingDate;
  }
  //Account: two cases: all account, specific account
  if (query?.accountId && query?.accountId !== "All")
    match.accountId = new ObjectId(query.accountId.toString());
  else delete match.accountId;
  return match;
};
