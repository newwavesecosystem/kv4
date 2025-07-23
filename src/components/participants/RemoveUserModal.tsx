import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useRecoilState } from "recoil";
import { removeUserModalState } from "~/recoil/atom";
import { Checkbox } from "../ui/checkbox";
import {websocketRemoveUser} from "~/server/WebsocketActions";

function RemoveUserModal() {
  const [removeParticipant, setRemoveParticipant] =
    useRecoilState(removeUserModalState);

  return (
    <Dialog
      open={removeParticipant.isActive}
      onOpenChange={() => {
        setRemoveParticipant({
          ...removeParticipant,
          isActive: !removeParticipant.isActive,
          userId: '0',
          isBan: false,
        });
      }}
    >
      <DialogContent className="rounded-xl border-0 bg-primary text-a11y sm:max-w-[425px] md:rounded-xl">
        <span className=" text-xl font-bold text-center mt-10">
          Remove user ({removeParticipant.userFullName})
        </span>
        <div className="mt-5 flex items-center space-x-2">
          <Checkbox
            onCheckedChange={(checked) => {
              setRemoveParticipant({
                ...removeParticipant,
                isBan: checked as boolean,
              });
            }}
            checked={removeParticipant.isBan}
            id="isBan"
            className="h-5 w-5"
          />
          <label
            htmlFor="isBan"
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Prevent this user from rejoining the session.
          </label>
        </div>
        <div className="grid gap-6 py-4">
          <div className="mt-7 flex w-full gap-6">
            <button
              className="w-full rounded-md bg-a11y/20 py-3"
              onClick={() => {
                // reset the state
                setRemoveParticipant({
                  ...removeParticipant,
                  isActive: !removeParticipant.isActive,
                  userId: '0',
                  isBan: false,
                });

                websocketRemoveUser(removeParticipant.userId,removeParticipant.isBan);
              }}
            >
              Yes
            </button>
            <button
              className="w-full rounded-md border border-a11y/20 py-3"
              onClick={() => {
                setRemoveParticipant({
                  ...removeParticipant,
                  isActive: !removeParticipant.isActive,
                });
              }}
            >
              No
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RemoveUserModal;
