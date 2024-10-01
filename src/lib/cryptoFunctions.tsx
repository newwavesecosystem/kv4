import CryptoJS from 'crypto-js';

// Secret key for encryption/decryption
const secretKey = 'm01whereismysecretstufss00@#';

export function CryptoDecrypt(value:string):string {
  const bytes = CryptoJS.AES.decrypt(value, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function CryptoEncrypt(value:string):string {
  return CryptoJS.AES.encrypt(value, secretKey).toString();
}
