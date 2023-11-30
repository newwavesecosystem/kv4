import React from "react";
import { useRecoilValue } from "recoil";
import { pollModalState } from "~/recoil/atom";
import PollModalCreate from "./PollModalCreate";
import PollModalHostLiveView from "./PollModalHostLiveView";
import PollModalParticipantLiveView from "./PollModalParticipantLiveView";
import PollModalParticipanVotedView from "./PollModalParticipanVotedView";
import PollModalEdit from "./PollModalEdit";

function PollModal() {
  const pollModal = useRecoilValue(pollModalState);
  const isUserHost = true;
  // const isUserHost = false;
  const hasVoted = pollModal.usersVoted.find((user) => user.id === user?.id);

  return (
    <>
      {pollModal.step === 1 && <PollModalCreate />}
      {pollModal.step === 2 && isUserHost && <PollModalHostLiveView />}
      {pollModal.step === 2 && !isUserHost && !hasVoted && (
        <PollModalParticipantLiveView />
      )}
      {pollModal.step === 2 &&
        !isUserHost &&
        (hasVoted || pollModal.isEnded) && <PollModalParticipanVotedView />}

        {/* disabled because of unheathly factors (updates can reset count etc)*/}
      {/* {pollModal.step === 3 && isUserHost && pollModal.isEdit && (
        <PollModalEdit />
      )} */}
    </>
  );
}

export default PollModal;
