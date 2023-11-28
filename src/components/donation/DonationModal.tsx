import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { donationModalState } from "~/recoil/atom";

import DonationModalCreate from "./DonationModalCreate";
import DonationModalInitiated from "./DonationModalInitiated";
import DonationModalCreated from "./DonationModalCreated";

function DonationModal() {
  const [donationState, setDonationState] = useRecoilState(donationModalState);

  return (
    <>
      {donationState.step === 1 && !donationState.isActive && (
        <DonationModalCreate />
      )}
      {donationState.step === 2 && <DonationModalCreated />}
      {donationState.step === 3 && <DonationModalInitiated />}
    </>
  );
}

export default DonationModal;
