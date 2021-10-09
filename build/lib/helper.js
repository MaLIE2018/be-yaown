"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64 = void 0;
function base64(input) {
    return new Buffer(input).toString("base64");
}
exports.base64 = base64;
