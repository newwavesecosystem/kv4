import React, { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useRecoilState, useRecoilValue } from "recoil";
import { authUserState, donationModalState } from "~/recoil/atom";
import { Checkbox } from "../ui/checkbox";
import { cn, formatNumber } from "~/lib/utils";
import { useToast } from "../ui/use-toast";

function DonationModalInitiated() {
  const [donationState, setDonationState] = useRecoilState(donationModalState);
  const [data, setData] = useState({
    description: "",
    uniqueNumber: "",
    donationAmount: "",
    isAnonymous: false,
  });
  const onChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const user = useRecoilValue(authUserState);
  const { toast } = useToast();

  return (
    <Dialog
      open={donationState.step === 3}
      onOpenChange={() => {
        setDonationState((prev) => ({
          ...prev,
          step: 0,
        }));
      }}
    >
      <DialogContent className="rounded-xl border-0 bg-primary text-a11y sm:max-w-[425px] md:rounded-xl">
        <div className="flex flex-col gap-5 py-6">
          <div className="flex flex-col">
            <span>Donation Name:</span>
            {donationState.donationName}
          </div>
          <div className="flex flex-col">
            <span>Add a description</span>
            <input
              type="text"
              name="description"
              placeholder="description"
              value={data.description}
              onChange={onChange}
              className=" mt-1 w-full truncate rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80  focus:shadow-none focus:outline-none "
            />
          </div>
          <div className="flex flex-col">
            <span>Add a unique number (Optional)</span>
            <input
              type="text"
              name="uniqueNumber"
              placeholder="unique number"
              value={data.uniqueNumber}
              onChange={onChange}
              className=" mt-1 w-full truncate rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80  focus:shadow-none focus:outline-none "
            />
          </div>
          {donationState.donationAmountType === "2" ? (
            <div className="flex flex-col">
              <span>Donation Amount</span>
              <input
                type="text"
                name="donationAmount"
                placeholder="0.00"
                value={data.donationAmount}
                onChange={onChange}
                className=" mt-1 w-full truncate rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80  focus:shadow-none focus:outline-none "
              />
            </div>
          ) : (
            <div className="">
              <button
                onClick={() => {
                  setData((prev) => ({
                    ...prev,
                    donationAmount: `${donationState.donationAmount}`,
                  }));
                }}
                className={cn(
                  "rounded-lg bg-a11y/20 px-4 py-1",
                  data.donationAmount && "border-2 border-a11y/20",
                )}
              >
                {formatNumber(donationState.donationAmount)}
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              onCheckedChange={(checked) => {
                setData((prev) => ({
                  ...prev,
                  isAnonymous: checked as boolean,
                }));
              }}
              checked={data.isAnonymous}
              id="isAnonymous"
              className="h-5 w-5"
            />
            <label
              htmlFor="isAnonymous"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Anonymous Donation
            </label>
          </div>
          <div className="flex items-center justify-center">
            <button
              disabled={!data.description || !data.donationAmount}
              onClick={() => {
                setDonationState((prev) => ({
                  ...prev,
                  usersDonated: [
                    ...prev.usersDonated,
                    {
                      donationAmount: parseInt(data.donationAmount),
                      donationDescription: data.description,
                      id: user?.id as number,
                      donationUniqueNumber: parseInt(data.uniqueNumber) || null,
                      email: data.isAnonymous ? null : (user?.email as string),
                      fullName: data.isAnonymous
                        ? null
                        : (user?.fullName as string),
                    },
                  ],
                  step: 0,
                  totalAmountDonatated:
                    prev.totalAmountDonatated + parseInt(data.donationAmount),
                }));
                // toast({
                //   description: `${data.isAnonymous ? "Anonymous" : user?.fullName} donated ${data.donationAmount}`,
                // })
              }}
              className="rounded-md bg-a11y/20 px-6 py-2 text-sm disabled:opacity-40"
            >
              Donation
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DonationModalInitiated;
