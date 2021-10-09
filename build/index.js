"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const services_1 = __importDefault(require("./services"));
const http_errors_1 = __importDefault(require("http-errors"));
const errorHandler_1 = __importDefault(require("./lib/errorHandler"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = express_1.default();
const origins = [process.env.FE_URL];
exports.PORT = process.env.PORT || 3001;
console.log(process.env.TS_NODE_DEV);
const corsOptions = {
    origin: function (origin, next) {
        if (origins.includes(origin)) {
            next(null, true);
        }
        else {
            next(http_errors_1.default(403, { m: "Check your cors settings!" }));
        }
    },
    credentials: true,
};
app.use(cors_1.default(corsOptions));
app.use(express_1.default.json());
app.use(cookie_parser_1.default());
app.use("/api/v1", services_1.default);
app.use(errorHandler_1.default);
if (!process.env.MDB_URL)
    throw new Error("MDB_URL not set!");
if (process.env._ENV !== "test") {
    mongoose_1.default.connect(process.env.MDB_URL, {}).then(() => {
        console.log("mongoose connected");
        app.listen(exports.PORT, () => {
            console.table({ "Server running on port ": exports.PORT });
        });
    });
}
else {
    app.listen(exports.PORT, () => {
        console.table({ "Server running on port ": exports.PORT });
    });
}
exports.default = app;
