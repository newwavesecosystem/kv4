const cookies_session_token="session";
export function getMyCookies(cookiesName:string):string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${cookiesName}=`);
  return parts.length === 2 ? parts?.pop()?.split(';').shift() ?? "" : "";
}

export function setMyCookies(cookiesName:string, cookiesValue:string, cookiesDays:number = 0):void {
  let expires = '';
  localStorage.setItem(cookiesName, cookiesValue);
  if (cookiesDays != 0) {
    const date = new Date();
    date.setTime(date.getTime() + (cookiesDays * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${cookiesName}=${cookiesValue || ''}${expires}; path=/`;
}

export function deleteMyCookies(cookiesName:string):void {
  document.cookie = `${cookiesName}=; Max-Age=-99999999;`;
}

export function GetOtherAppCurrentSessionToken() {
  const val= getMyCookies(cookies_session_token);
  console.log(cookies_session_token, val);
  return val;
}