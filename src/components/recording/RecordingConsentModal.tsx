import React from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {
  authUserState,
  chatModalState,
  connectedUsersState,
  leaveRoomCallModalState, participantListState,
  participantsModalState,
  postLeaveMeetingState,
  recordingModalState
} from "~/recoil/atom";
import { useToast } from "../ui/use-toast";
import AlertTriangleIcon from "../icon/outline/AlertTriangleIcon";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {IParticipant} from "~/types/index";
import {CurrentUserRoleIsModerator} from "~/lib/checkFunctions";
import {websocketLeaveMeeting} from "~/server/WebsocketActions";

function RecordingConsentModal() {
  const [recordingState, setRecordingState] =
    useRecoilState(recordingModalState);
  const { toast } = useToast();
  const [leaveRoomCallModal, setRoomCallModal] = useRecoilState(
      leaveRoomCallModalState,
  );
  const [postLeaveMeeting, setPostLeaveMeeting] = useRecoilState(
      postLeaveMeetingState,
  );

  const [participantList, setParticipantList] = useRecoilState(participantListState);

  const user = useRecoilValue(authUserState);

  return (
    <AlertDialog
      open={recordingState.recordingConsent && !CurrentUserRoleIsModerator(participantList,user)}
      onOpenChange={() => {
        console.log('Recording Consent opened')
      }}
    >
      <AlertDialogContent className="text-a11y rounded-xl border-0 bg-primary py-3 sm:max-w-[425px] md:rounded-xl">
        <div className="grid gap-3 py-4">
          <div className="flex gap-2 text-2xl">
            <AlertTriangleIcon className="h-8 w-8 " />
            <span>This meeting is being recorded</span>
          </div>
          <p>
            By continuing to be in the meeting, you are consenting to be recorded
          </p>
          <div className="mt-7 flex w-full gap-6">
            <button
              className="border-a11y/20 w-full rounded-md border py-3"
              onClick={() => {
                setRecordingState((prev) => ({
                  ...prev,
                  recordingConsent: false,
                }));
              }}
            >
              Accept
            </button>
            <button
                className="w-full rounded-md bg-a11y/20 py-3"
                onClick={() => {
                  setRoomCallModal(false);
                  setPostLeaveMeeting({
                    ...postLeaveMeeting,
                    isLeaveRoomCall: true,
                  });
                  websocketLeaveMeeting(user!);
                }}
            >
              Leave Session
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default RecordingConsentModal;
