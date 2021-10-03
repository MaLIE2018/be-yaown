import { KJUR, KEYUTIL } from 'jsrsasign';

export function sign(data, key: string): string {
  // initialize
  let sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
  let rsaKey = KEYUTIL.getKey(key)
  // initialize for signature generation
  sig.init(rsaKey); // rsaPrivateKey of RSAKey object
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

