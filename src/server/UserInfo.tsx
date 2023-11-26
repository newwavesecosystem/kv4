import { authUserState } from "~/recoil/atom";
import {useRecoilValue} from "recoil";

const user = useRecoilValue(authUserState);
let meetingDetails = user?.meetingDetails;
export const names = JSON.parse(meetingDetails)?.fullname
export const authToken = JSON.parse(meetingDetails)?.authToken
export const internalUserID = JSON.parse(meetingDetails)?.internalUserID
export const externUserID =JSON.parse(meetingDetails)?.externUserID
export const meetingID =JSON.parse(meetingDetails)?.meetingID
export const voicebridge = JSON.parse(meetingDetails)?.voicebridge
export const welcomeMessage =JSON.parse(meetingDetails)?.welcome
export const role =JSON.parse(meetingDetails)?.role
export const customLogoURL =JSON.parse(meetingDetails)?.customLogoURL
export const dialnumber =JSON.parse(meetingDetails)?.dialnumber
export const avatarURL =JSON.parse(meetingDetails)?.avatarURL
export const allowStartStopRecording =JSON.parse(meetingDetails)?.allowStartStopRecording
export const logoutUrl =JSON.parse(meetingDetails)?.logoutUrl
export const muteOnStart =JSON.parse(meetingDetails)?.muteOnStart
export const sessionToken = localStorage.getItem('sessiontoken')
export const  meetingTitle = JSON.parse(meetingDetails)?.confname
