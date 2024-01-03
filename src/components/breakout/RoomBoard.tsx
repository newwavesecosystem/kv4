import { useMemo, useState } from "react";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import UsersCard from "./UsersCard";
import { IColumnBreakOutRoom, IUserBreakOutRoom } from "~/types";
import { breakOutModalState } from "~/recoil/atom";
import { useRecoilState } from "recoil";

function RoomBoard() {
  const [breakOutRoomState, setBreakOutRoomState] =
    useRecoilState(breakOutModalState);

  const columnsId = useMemo(
    () => breakOutRoomState.rooms.map((col) => col.id),
    [breakOutRoomState.rooms],
  );

  const [activeColumn, setActiveColumn] = useState<IColumnBreakOutRoom | null>(
    null,
  );

  const [activeUser, setActiveUser] = useState<IUserBreakOutRoom | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  function deleteUser(id: string) {
    setBreakOutRoomState((prev) => {
      const userIndex = prev.users.findIndex((user) => user.id === id);

      const user = prev.users[userIndex];

      const newUsers = [...prev.users];

      if (!user) return prev;

      newUsers[userIndex] = {
        ...user,
        columnId: "users",
      };

      return {
        ...prev,
        users: newUsers,
      };
    });
  }

  function updateColumn(id: string, title: string) {
    const newColumns = breakOutRoomState.rooms.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setBreakOutRoomState((prev) => ({
      ...prev,
      rooms: newColumns,
    }));
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "User") {
      setActiveUser(event.active.data.current.user as IUserBreakOutRoom | null);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveUser(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    setBreakOutRoomState((prev) => {
      const activeColumnIndex = prev.rooms.findIndex(
        (col) => col.id === activeId,
      );

      const overColumnIndex = prev.rooms.findIndex((col) => col.id === overId);

      return {
        ...prev,
        rooms: arrayMove(prev.rooms, activeColumnIndex, overColumnIndex),
      };
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAUser = active.data.current?.type === "User";
    const isOverAUser = over.data.current?.type === "User";

    if (!isActiveAUser) return;

    // Im dropping a User over another User
    if (isActiveAUser && isOverAUser) {
      const activeIndex = breakOutRoomState.users.findIndex(
        (t) => t.id === activeId,
      );
      const overIndex = breakOutRoomState.users.findIndex(
        (t) => t.id === overId,
      );

      if (
        breakOutRoomState.users[activeIndex].columnId !==
        breakOutRoomState.users[overIndex].columnId
      ) {
        setBreakOutRoomState((prev) => ({
          ...prev,
          users: [
            ...prev.users.slice(0, activeIndex),
            {
              ...prev.users[activeIndex],
              columnId: prev.users[overIndex].columnId,
            },
            ...prev.users.slice(activeIndex + 1),
          ],
        }));
        return;
      }
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a User over a column
    if (isActiveAUser && isOverAColumn) {
      const activeIndex = breakOutRoomState.users.findIndex(
        (t) => t.id === activeId,
      );
      setBreakOutRoomState((prev) => ({
        ...prev,
        users: [
          ...prev.users.slice(0, activeIndex),
          {
            ...prev.users[activeIndex],
            columnId: overId.toString(),
          },
          ...prev.users.slice(activeIndex + 1),
        ],
      }));
    }
  }

  return (
    <div className="h-full w-full text-xs text-a11y">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <SortableContext items={columnsId}>
            {breakOutRoomState.rooms.map((col) => (
              <ColumnContainer
                key={col.id}
                column={col}
                updateColumn={updateColumn}
                deleteUser={deleteUser}
                users={breakOutRoomState.users.filter(
                  (user) => user.columnId === col.id,
                )}
              />
            ))}
          </SortableContext>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                updateColumn={updateColumn}
                deleteUser={deleteUser}
                users={breakOutRoomState.users.filter(
                  (user) => user.columnId === activeColumn.id,
                )}
              />
            )}
            {activeUser && (
              <UsersCard user={activeUser} deleteUser={deleteUser} />
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </div>
  );
}

export default RoomBoard;
