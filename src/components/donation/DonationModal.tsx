import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authUserState, donationModalState } from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";

function DonationModal() {
  const [donationState, setDonationState] = useRecoilState(donationModalState);

  const user = useRecoilValue(authUserState);
  return (
    <Dialog
      open={donationState.step === 1}
      onOpenChange={() => {
        setDonationState((prev) => ({
          ...prev,
          step: 0,
        }));
      }}
    >
      <DialogContent className="rounded-xl border-0 bg-primary text-a11y sm:max-w-[425px] md:rounded-xl">
        {donationState.step === 1 && !donationState.isActive && (
          <div className="flex flex-col gap-9 py-6">
            <label htmlFor="">
              <span>Donation Name</span>
              <input
                type="text"
                placeholder="Donation Name"
                className="mt-3 w-full rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80 focus:shadow-none focus:outline-none md:w-full"
              />
            </label>
            <div>
              <span>Donation Amount</span>
              <RadioGroup
                className=" mt-3 flex items-center gap-6 text-a11y"
                defaultValue="2"
              >
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="1">Fixed</label>
                  <RadioGroupItem value="1" id="1" />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="4">Any Amount</label>
                  <RadioGroupItem value="2" id="2" />
                </div>
              </RadioGroup>
              <input
                type="text"
                placeholder="Donation Amount"
                className="mt-6 w-full rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80 focus:shadow-none focus:outline-none md:w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" className="h-5 w-5" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable flash notification
              </label>
            </div>
            <div className="flex items-center justify-center">
              <button className="rounded-lg bg-a11y/40 px-10 py-2">
                Create
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DonationModal;
