import React from "react";
import { useRecoilState } from "recoil";
import { breakOutModalState } from "~/recoil/atom";
import BreakOutModalCreate from "./BreakOutModalCreate";
import BreakOutModalView from "./BreakOutModalView";

function BreakOutModal() {
  const [breakOutRoomState, setBreakOutRoomState] =
    useRecoilState(breakOutModalState);

  return (
    <>
      {breakOutRoomState.step === 1 && !breakOutRoomState.isActive && (
        <BreakOutModalCreate />
      )}
      {breakOutRoomState.step === 2 && <BreakOutModalView />}
    </>
  );
}

export default BreakOutModal;
