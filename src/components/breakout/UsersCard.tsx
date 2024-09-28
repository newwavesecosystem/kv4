import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IUserBreakOutRoom } from "~/types";
import CloseIcon from "../icon/outline/CloseIcon";
import { cn } from "~/lib/utils";
import { MouseEvent } from "react";

interface Props {
  user: IUserBreakOutRoom;
  deleteUser: (id: string) => void;
}

function UsersCard({ user, deleteUser }: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: user.userId || user.id || `temp-${Math.random()}`,
    data: {
      type: "User",
      user,
    },
    disabled: false,
  });

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();  // This prevents the click from bubbling up to the draggable element
    const id = user.userId || user.id;
    if (!id) return;
    deleteUser(id);
  };

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
       relative flex cursor-grab items-center rounded border-2 border-a11y/40 p-2.5  text-left text-a11y
      "
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex h-[25px] select-none items-center text-left text-a11y",
        user.columnId !== "users" && "rounded bg-a11y/20 px-2 py-1"
      )}
    >
      <div {...attributes} {...listeners} className="w-full cursor-grab truncate">
        {user.name}
      </div>

      {user.columnId !== "users" && (
        <button
          onClick={handleDelete}
          className="stroke-white pl-2 cursor-pointer"
        >
          <CloseIcon className="h-4 w-4 " />
        </button>
      )}
    </div>
  );
}

export default UsersCard;
