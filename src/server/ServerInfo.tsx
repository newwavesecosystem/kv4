export const laravelAppURL = "https://dev.konn3ct.ng";
export const extRegisterURL = "https://k40.konn3ct.ng";
export const engineBaseURL = "devmeet.konn3ct.ng";
export const tokenValidationURL = `https://${engineBaseURL}/bigbluebutton/api/enter`;
export const joinURL = `http://127.0.0.1:8000/api/k4/`;
export const sfuURL = `wss://${engineBaseURL}/bbb-webrtc-sfu`;
export const websocketURL = `https://${engineBaseURL}/html5client/sockjs`;
export const aiBotURL = `${extRegisterURL}/ai-bot-message`;
// export const aiEnginesURL = `http://34.207.102.15:3131/konn3ctai`;
export const aiEnginesURL = `https://k4aiengine.konn3ct.ng/konn3ctai`;
// export const aiEnginesURL = `http://localhost:3002/konn3ctai`;

export function generateRandomId(length:number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export function generateSmallId() {
    const characters = new Date();
    return characters.getSeconds() + characters.getMilliseconds();
}

export function generatesSmallId() {
    const characters = new Date();
    return characters.getMilliseconds().toPrecision(3);
}
