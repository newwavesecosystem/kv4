import React, { useEffect, useState } from "react";
import {IParticipant} from "~/types/index";
import {useRecoilState, useRecoilValue} from "recoil";
import {authUserState, participantListState} from "~/recoil/atom";


export function CurrentUserIsPresenter() {
  const [participantList, setParticipantList] = useRecoilState(participantListState);

  const user = useRecoilValue(authUserState);

  const cip = participantList?.filter((eachItem: IParticipant) => eachItem?.intId == user?.meetingDetails?.internalUserID)[0]?.presenter;

  return cip ?? false;
}

export function GetCurrentUserRole() {
  const [participantList, setParticipantList] = useRecoilState(participantListState);

  const user = useRecoilValue(authUserState);

  return participantList.filter((e:IParticipant)=>e.intId == user?.meetingDetails?.internalUserID)[0]?.role;
}

export function CurrentUserRoleIsModerator() {
  const [participantList, setParticipantList] = useRecoilState(participantListState);

  const user = useRecoilValue(authUserState);

  const curim= participantList.filter((e:IParticipant)=>e.intId == user?.meetingDetails?.internalUserID)[0]?.role == ModeratorRole;

  return curim ?? false;
}

export function FindAvatarfromUserId(userId: string) {
  const [participantList, setParticipantList] = useRecoilState(participantListState);

  let damola = participantList.filter((item: any) => item?.userId == userId);
  console.log("damola");
  console.log(damola);
  if (damola.length > 0) {
    return damola[0]?.avatar;
  } else {
    return "";
  }
}

export function FindUserNamefromUserId(userId: string) {
  const [participantList, setParticipantList] = useRecoilState(participantListState);

  let damola = participantList.filter((item: any) => item?.userId == userId);
  console.log("damola");
  console.log(damola);
  if (damola.length > 0) {
    return damola[0]?.name;
  } else {
    return "unknown";
  }
}

export function ModeratorRole() {
  return "MODERATOR";
}

export function ViewerRole() {
  return "VIEWER";
}
