import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useMemo, useState } from "react";
import UsersCard from "./UsersCard";
import { IColumnBreakOutRoom, IUserBreakOutRoom } from "~/types";
import { breakOutModalState } from "~/recoil/atom";
import { useRecoilState } from "recoil";

interface Props {
  column: IColumnBreakOutRoom;
  updateColumn: (id: string, title: string) => void;
  deleteUser: (id: string) => void;
  users: IUserBreakOutRoom[];
}

function ColumnContainer({ column, users, deleteUser }: Props) {
  const [breakOutRoomState, setBreakOutRoomState] =
    useRecoilState(breakOutModalState);
  const usersIds = useMemo(() => {
    return users.map((user) => user.id);
  }, [users]);

  const { setNodeRef, transform, transition } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const [isEditing, setIsEditing] = useState(false);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    // if (title.length < 3) return;
    setBreakOutRoomState((prev) => {
      const newColumns = prev.rooms.map((col) => {
        if (col.id !== column.id) return col;
        return { ...col, title };
      });

      return {
        ...prev,
        rooms: newColumns,
      };
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className=" flex h-40 w-[150px]  flex-col rounded-md"
    >
      {/* Column title */}
      <div
        className="
        flex items-center justify-between rounded-md rounded-b-none border border-a11y/40 p-2"
      >
        <input
          type="text"
          className="peer w-full bg-transparent px-3 placeholder:text-a11y/80 focus:shadow-none focus:outline-none"
          value={column.title}
          onChange={handleOnChange}
          disabled={column.id === breakOutRoomState.rooms[0]?.id}
          placeholder={`${column.title}`}
        />
        <p className="visible peer-focus:invisible">({users.length})</p>
      </div>

      {/* Column User container */}
      <div className="mt-3 flex flex-grow flex-col gap-2 overflow-y-auto overflow-x-hidden border border-a11y/40 p-2">
        {/*<SortableContext items={usersIds}>*/}
          {users.map((user) => (
            <UsersCard key={user.id} user={user} deleteUser={deleteUser} />
          ))}
        {/*</SortableContext>*/}
      </div>
    </div>
  );
}

export default ColumnContainer;
