"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = void 0;
const jsrsasign = require('jsrsasign');
const KEYUTIL = jsrsasign.KEYUTIL;
const KJUR = jsrsasign.KJUR;
function sign(data, key) {
    // initialize
    let sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
    const rsaKey = KEYUTIL.getKeyFromPlainPrivatePKCS8PEM(key);
    // initialize for signature generation
    sig.init(rsaKey); // rsaPrivateKey of RSAKey object
    // update data
    sig.updateString(data);
    // calculate signature
    let sigValueHex = sig.sign();
    return hexToB64(sigValueHex);
}
exports.sign = sign;
const hexToB64 = (str) => {
    const buff = Buffer.from(str, 'hex');
    return buff.toString('base64');
};
