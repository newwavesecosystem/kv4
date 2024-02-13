import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useMemo } from "react";
import UsersCard from "./UsersCard";
import { IColumnBreakOutRoom, IUserBreakOutRoom } from "~/types";

interface Props {
  column: IColumnBreakOutRoom;
  updateColumn: (id: string, title: string) => void;
  deleteUser: (id: string) => void;
  users: IUserBreakOutRoom[];
}

function ColumnContainer({ column, users, deleteUser }: Props) {
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
        <div className="flex items-center gap-2">
          {column.title} ({users.length})
        </div>
      </div>

      {/* Column User container */}
      <div className="mt-3 flex flex-grow flex-col gap-2 overflow-y-auto overflow-x-hidden border border-a11y/40 p-2">
        <SortableContext items={usersIds}>
          {users.map((user) => (
            <UsersCard key={user.id} user={user} deleteUser={deleteUser} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default ColumnContainer;
