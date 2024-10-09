import React, { useEffect, useState } from "react";
import {IAuthUser, IParticipant} from "~/types/index";


export function CurrentUserIsPresenter(participantList:IParticipant[],user:IAuthUser|null) {

  const cip = participantList?.filter((eachItem: IParticipant) => eachItem?.intId == user?.meetingDetails?.internalUserID)[0]?.presenter;

  return cip ?? false;
}

export function GetCurrentUserRole(participantList:IParticipant[],user:IAuthUser|null) {
  return participantList.filter((e:IParticipant)=>e.intId == user?.meetingDetails?.internalUserID)[0]?.role;
}

export function CurrentUserRoleIsModerator(participantList:IParticipant[],user:IAuthUser|null) {
  const curim= participantList.filter((e:IParticipant)=>e.intId == user?.meetingDetails?.internalUserID)[0]?.role == ModeratorRole();

  return curim ?? false;
}

export function FindAvatarfromUserId(userId: string, participantList:IParticipant[]) : string {
  let damola = participantList.filter((item: any) => item?.userId == userId);
  console.log("damola");
  console.log(damola);

  return damola.length != 0 ? damola[0]!.avatar : "https://static.thenounproject.com/png/363640-200.png";
}

export function FindUserNamefromUserId(userId: string,participantList:IParticipant[]):string {

  let damola = participantList.filter((item: any) => item?.userId == userId);
  console.log("damola");
  console.log(damola);
  return damola.length != 0 ? damola[0]!.name : "unknown";
}

export function ModeratorRole() {
  return "MODERATOR";
}

export function ViewerRole() {
  return "VIEWER";
}
