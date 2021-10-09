"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuery = void 0;
const bson_1 = require("bson");
const getQuery = (query, userId) => {
    let match = {
        bookingDate: {},
        accountId: new bson_1.ObjectId(),
        userId: new bson_1.ObjectId(userId),
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
    }
    else {
        delete match.bookingDate;
    }
    //Account: two cases: all account, specific account
    if (query?.accountId && query?.accountId !== "All")
        match.accountId = new bson_1.ObjectId(query.accountId.toString());
    else
        delete match.accountId;
    return match;
};
exports.getQuery = getQuery;
