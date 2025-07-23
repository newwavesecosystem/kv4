import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authUserState, donationModalState } from "~/recoil/atom";
import { Dialog, DialogContent } from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import axios from "axios";
import * as ServerInfo from "~/server/ServerInfo";
import {websocketSendMessage} from "~/server/WebsocketActions";

function DonationModalCreate() {
  const [donationState, setDonationState] = useRecoilState(donationModalState);

  const user = useRecoilValue(authUserState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDonationState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createDonation= ()=>{
    axios.post(`${ServerInfo.laravelAppURL}/api/k4/donation`,{
      "name": donationState.donationName,
      "type": donationState.donationAmountType,
      "amount": donationState.donationAmount,
      "id": user?.meetingDetails?.externMeetingID
    })
        .then(function (response) {
          const responseData = response.data;

          console.log(responseData)
          console.log(response);

          if (responseData?.success) {
            websocketSendMessage(user?.meetingDetails?.internalUserID,user?.meetingDetails?.confname,user?.meetingDetails?.internalUserID,`Donation created|${donationState.donationName}|${donationState.donationAmountType}|${donationState.donationAmount}|${responseData?.data}`);
          }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .finally(function () {
          // always executed
        })
  }


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
        <div className="flex flex-col gap-9 py-6">
          <label htmlFor="donation_name">
            <span>Donation Name</span>
            <input
              name="donationName"
              onChange={handleChange}
              value={donationState.donationName}
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
              value={donationState.donationAmountType}
              onValueChange={(value) => {
                setDonationState((prev) => ({
                  ...prev,
                  donationAmountType: value,
                }));
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="1">Fixed</label>
                <RadioGroupItem value="1" id="1" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label htmlFor="2">Any Amount</label>
                <RadioGroupItem value="2" id="2" />
              </div>
            </RadioGroup>
            <input
              type="tel"
              name="donationAmount"
              onChange={handleChange}
              value={donationState.donationAmount}
              placeholder="Donation Amount"
              className="mt-6 w-full rounded-md border border-a11y/20 bg-transparent px-2 py-2 placeholder:text-a11y/80 focus:shadow-none focus:outline-none md:w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              onCheckedChange={(checked) => {
                setDonationState((prev) => ({
                  ...prev,
                  enableFlashNotification: checked as boolean,
                }));
              }}
              checked={donationState.enableFlashNotification}
              id="enable_flash_notification"
              className="h-5 w-5"
            />
            <label
              htmlFor="enable_flash_notification"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable flash notification
            </label>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={() => {
                setDonationState((prev) => ({
                  ...prev,
                  step: 0,
                  isActive: true,
                  donationCreatedAt: new Date(),
                  donationCreatorId: user?.id as number,
                  donationCreatorName: user?.fullName as string,
                }));

                createDonation();

              }}
              disabled={
                !donationState.donationName ||
                !donationState.donationAmount ||
                isNaN(Number(donationState.donationAmount)) ||
                !donationState.donationAmountType
              }
              className="rounded-lg bg-a11y/40 px-10 py-2 disabled:opacity-30"
            >
              Create
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DonationModalCreate;
