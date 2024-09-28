import {CryptoDecrypt, CryptoEncrypt} from "~/lib/cryptoFunctions";

const storage_session_token="U2FsdGVkX18lNdZhXOmoOMWWJ7Xlrh6Ay2c5oQ40NJE=";
const storage_theme_color="theme_color";
export function getMyStorage(storageName:string):string {
  // Ensure this runs on the client side (not during SSR)
  // if (typeof window !== 'undefined') {
    // Get item from localStorage
    return CryptoDecrypt(localStorage.getItem(storageName)??"");
  // }else{
  //   return "";
  // }
}

export function setMyStorage(storageName:string, storageValue:string):void {
  // if (typeof window !== 'undefined') {
    localStorage.setItem(storageName, CryptoEncrypt(storageValue));
  // }
}

export function deleteMyStorage(storageName:string):void {
  // if (typeof window !== 'undefined') {
    localStorage.removeItem(storageName);
  // }
}

export function GetCurrentSessionToken() {
    console.log("getting sessionToken")
  const val= getMyStorage(storage_session_token);
  console.log(storage_session_token, val);
  return val;
}

export function SetCurrentSessionToken(sessionToken:string) {
  console.log("setting sessionToken")
  return setMyStorage(storage_session_token,sessionToken);
}
