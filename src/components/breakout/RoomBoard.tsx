import { useMemo, useState } from "react";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDndContext,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import UsersCard from "./UsersCard";
import { IColumnBreakOutRoom, IUserBreakOutRoom } from "~/types";
import { breakOutModalState } from "~/recoil/atom";
import { useRecoilState } from "recoil";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import { cn } from "~/lib/utils";

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
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  function deleteUser(id: string) {
    setBreakOutRoomState((prev) => {
      const updatedUsers = prev.users.map((user) =>
        user.userId === id ? { ...user, columnId: "users" } : user
      );

      return {
        ...prev,
        users: updatedUsers,
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
    const { data } = event.active;
    if (data.current?.type === "User") {
      setActiveUser(data.current.user as IUserBreakOutRoom);
    } else if (data.current?.type === "Column") {
      setActiveColumn(data.current.column as IColumnBreakOutRoom);
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
      const activeIndex = breakOutRoomState.users.findIndex((t) => t.userId === activeId);

      const overIndex = breakOutRoomState.users.findIndex(
        (t) => t.userId === overId,
      );

      if (
        breakOutRoomState.users[activeIndex]?.columnId !==
        breakOutRoomState.users[overIndex]?.columnId
      ) {
        setBreakOutRoomState((prev: any) => ({
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
        (t) => t.userId === activeId,
      );
      setBreakOutRoomState((prev: any) => ({
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
  const dndContext = useDndContext();
  return (
    <div className="h-full w-full text-xs text-a11y">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4",
          dndContext.active ? "snap-none" : "snap-x snap-mandatory",
        )}>
          <SortableContext items={columnsId}>
            {breakOutRoomState.rooms.map((col) => (
              <ColumnContainer
                key={col.id}
                column={col}
                updateColumn={updateColumn}
                deleteUser={deleteUser}
                users={breakOutRoomState.users.filter((user) => user.columnId === col.id)}
              />
            ))}
          </SortableContext>
        </div>

        {"document" in window &&
          createPortal(
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
