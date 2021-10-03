import { KJUR, KEYUTIL } from 'jsrsasign';

export function sign(data, key: string): string {
  // initialize
  let sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
  // initialize for signature generation
  let keyutil = new KEYUTIL();
  const keyObj = keyutil.getKeyFromPlainPrivatePKCS8PEM(key);
  sig.init(keyObj); // rsaPrivateKey of RSAKey object
  // update data
  sig.updateString(data);
  // calculate signature
  let sigValueHex = sig.sign();
  return hexToB64(sigValueHex);
}

const hexToB64 = (str: string): string => {
  const buff = Buffer.from(str, 'hex');
  return buff.toString('base64');
};
