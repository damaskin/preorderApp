import * as admin from 'firebase-admin';

import type { BranchDocument, BranchRecord } from './types';

const collection = () => admin.firestore().collection('branches');

export const getBranchById = async (branchId: string): Promise<BranchRecord | null> => {
  const snapshot = await collection().doc(branchId).get();

  if (!snapshot.exists) {
    return null;
  }

  return { id: snapshot.id, ...(snapshot.data() as BranchDocument) };
};

export const linkBranchToChat = async (
  branchId: string,
  chatId: number,
  userId: number
): Promise<BranchRecord> => {
  const ref = collection().doc(branchId);

  await ref.set(
    {
      telegramChatId: chatId,
      telegramUserId: userId
    },
    { merge: true }
  );

  const snapshot = await ref.get();

  return { id: snapshot.id, ...(snapshot.data() as BranchDocument) };
};
