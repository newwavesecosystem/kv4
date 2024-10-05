import {decryptData, encryptData} from "~/lib/cryptoFunctions";

const storage_session_token="U2FsdGVkX18lNdZhXOmoOMWWJ7Xlrh6Ay2c5oQ40NJE=";
const storage_session_ejected="U2FsdGVkX18lNdZhXOmoOMWWJ7Xlrh6Ay2c5oQ40NJE=-";
const storage_theme_color="theme_color";
export async function getMyStorage(storageName: string): Promise<string> {
    return await decryptData(localStorage.getItem(storageName) ?? "");
}

export async function setMyStorage(storageName: string, storageValue: string): Promise<void> {
    localStorage.setItem(storageName, await encryptData(storageValue));
}

export function deleteMyStorage(storageName:string):void {
    localStorage.removeItem(storageName);
}

export function GetCurrentSessionToken() {
  const val= getMyStorage(storage_session_token);
  console.log(storage_session_token, val);
  return val;
}

export function SetCurrentSessionToken(sessionToken:string) {
  return setMyStorage(storage_session_token,sessionToken);
}

export function GetCurrentSessionEjected() {
    console.log("getting storage_session_ejected")
  const val= getMyStorage(storage_session_ejected);
  console.log(storage_session_ejected, val);
  return val;
}

export function SetCurrentSessionEjected(sessionToken:string) {
  console.log("setting storage_session_ejected")
  return setMyStorage(storage_session_ejected,sessionToken);
}
