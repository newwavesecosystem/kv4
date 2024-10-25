'use client'

import Bowser from 'bowser';

let userAgent="Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36";
if (typeof window !== "undefined") {
  userAgent = window.navigator.userAgent;
}
const BOWSER_RESULTS = Bowser.parse(userAgent);

const isPhone = BOWSER_RESULTS.platform.type === 'mobile';
// we need a 'hack' to correctly detect ipads with ios > 13
const isTablet = BOWSER_RESULTS.platform.type === 'tablet' || (BOWSER_RESULTS.os.name === 'macOS' && window.navigator.maxTouchPoints > 0);
const isMobile = isPhone || isTablet;
let hasMediaDevices = false;
if (typeof navigator !== "undefined") {
  hasMediaDevices = !!navigator.mediaDevices;
}
const osName = BOWSER_RESULTS.os.name;
const isIos = osName === 'iOS' || (isTablet && osName=="macOS");
const isMacos = osName === 'macOS';
const isIphone = !!(userAgent.match(/iPhone/i));

const isPortrait = () => window.innerHeight > window.innerWidth;

const deviceInfo = {
  isTablet,
  isPhone,
  isMobile,
  hasMediaDevices,
  osName,
  isPortrait,
  isIos,
  isMacos,
  isIphone,
};

export default deviceInfo;
