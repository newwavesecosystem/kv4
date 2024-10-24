import React, {useEffect, useState} from "react";
import { cn } from "~/lib/utils";
import SingleCameraComponent from "./SingleCameraComponent";
import {IParticipant, IParticipantCamera} from "~/types/index";
import {useRecoilValue} from "recoil";
import {participantCameraListState} from "~/recoil/atom";

const ParticipantsCameraComponent = ({ participantList, pinnedParticipant, paginateParticipants}: {
    participantList: IParticipant[];
    pinnedParticipant: IParticipant[];
    paginateParticipants: IParticipant[];
}) => {
  const participantsPerPage = 8; // Limit to 8 participants per page
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(participantList.length / participantsPerPage);
  const participantCameraList = useRecoilValue(participantCameraListState);

  return (
      <div>
        {/* Render participants */}
        <div
            className={cn(
                "m-auto h-[calc(100vh-198px)] items-center justify-center p-4",
                paginateParticipants.length === 1 && "flex items-center justify-center",
                paginateParticipants.length === 2 && "grid gap-2 grid-cols-2 mt-5",
                paginateParticipants.length === 3 && "grid gap-2 grid-cols-2 lg:grid-cols-3",
                paginateParticipants.length >= 4 && "grid gap-2 grid-cols-2",
                paginateParticipants.length >= 5 && "grid gap-2 md:grid-cols-3",
                paginateParticipants.length >= 7 && "grid gap-2 md:grid-cols-4",
                paginateParticipants.length >= 13 && "grid gap-2 md:grid-cols-5",
                paginateParticipants.length >= 3 && pinnedParticipant.length > 0 && "md:!grid-cols-4"
            )}
            style={{ paddingTop: "1.5rem" }}
        >
          {paginateParticipants.map((participant, index) => (
              <SingleCameraComponent
                  index={index}
                  key={participant.id}
                  participant={participant}
                  userCamera={participantCameraList.filter(
                      (cItem:IParticipantCamera) => cItem.intId === participant.intId
                  )[0]}
              />
          ))}
        </div>

      </div>
  );
};

export default ParticipantsCameraComponent;
