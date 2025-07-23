import { IParticipant, IWaitingUser } from '~/types';

export const addOrUpdateUser = (list: IParticipant[], user: IParticipant): IParticipant[] => {
  const index = list.findIndex((p) => p.intId === user.intId);
  if (index > -1) {
    const newList = [...list];
    newList[index] = { ...newList[index], ...user };
    return newList;
  } else {
    return [...list, user];
  }
};

export const removeUser = (list: IParticipant[], userId: string): IParticipant[] => {
  return list.filter((p) => p.intId !== userId);
};

export const updateUser = (list: IParticipant[], user: Partial<IParticipant> & { id: string }): IParticipant[] => {
    const index = list.findIndex((p) => p.id === user.id);
    if (index > -1) {
        const newList = [...list];
        // newList[index] = { ...newList[index], ...user };
        return newList;
    }
    return list;
};

export const updateWaitingUser = (list: IWaitingUser[], user: IWaitingUser): IWaitingUser[] => {
    const index = list.findIndex((p) => p.intId === user.intId);
    if (index > -1) {
        const newList = [...list];
        newList[index] = { ...newList[index], ...user };
        return newList;
    } else {
        return [...list, user];
    }
};
