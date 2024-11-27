export const laravelAppURL = process.env.NEXT_PUBLIC_DASHBOARD_URL;
export const extRegisterURL = "https://bbb-sam-bridge.vercel.app";
export const translateURL = "https://newmegatongueapi.staging.5starcompany.com.ng/api";
export const engineBaseURL = process.env.NEXT_PUBLIC_ENGINE_DOMAIN;
export const tokenValidationURL = `https://${engineBaseURL}/bigbluebutton/api/enter`;
export const turnStunApiURL = `https://${engineBaseURL}/bigbluebutton/api/stuns`;
// export const joinURL = `http://127.0.0.1:8000/api/app/`;
export const joinURL = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/app/`;
export const sfuURL = `wss://${engineBaseURL}/bbb-webrtc-sfu`;
export const websocketURL = `https://${engineBaseURL}/html5client/sockjs`;
export const aiBotURL = `${extRegisterURL}/ai-bot-message`;
export const aiEnginesURL = `https://kv4-ai.vercel.app/konn3ctai`;
export const captionURL = 'https://k4caption.konn3ct.ng';
// export const aiEnginesURL = `https://k4aiengine.konn3ct.ng/konn3ctai`;
// export const aiEnginesURL = `http://localhost:3001/konn3ctai`;

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
