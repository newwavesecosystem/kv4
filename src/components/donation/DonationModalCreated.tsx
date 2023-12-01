import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useRecoilState } from "recoil";
import { donationModalState } from "~/recoil/atom";
import dayjs from "dayjs";
import { formatNumber } from "~/lib/utils";

function DonationModalCreated() {
  const [donationState, setDonationState] = useRecoilState(donationModalState);

  return (
    <Dialog
      open={donationState.step === 2}
      onOpenChange={() => {
        setDonationState((prev) => ({
          ...prev,
          step: 0,
        }));
      }}
    >
      <DialogContent className="rounded-xl border-0 bg-primary text-a11y sm:max-w-[425px] md:rounded-xl">
        <div className="flex flex-col gap-9 py-6">
          <span className="text-center">Active Donation</span>
          <div className="flex flex-col gap-1">
            <span>Donation Name:</span>
            <span>{donationState.donationName}</span>
            <span>
              {dayjs(donationState.donationCreatedAt).format(
                "DD/MM/YYYY h:mmA",
              )}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span>Donations Received:</span>
            <span className="rounded-md bg-a11y/20 px-2 py-2">
              {formatNumber(donationState.totalAmountDonatated)}
            </span>
          </div>
          <div className="flex justify-center ">
            <button
              onClick={() => {
                setDonationState((prev) => ({
                  ...prev,
                  step: 0,
                  isActive: false,
                }));
              }}
              className="rounded-md bg-a11y/20 px-5 py-2"
            >
              End Donation
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DonationModalCreated;
