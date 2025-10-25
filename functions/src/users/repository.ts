import * as admin from 'firebase-admin';

export type UserDocument = {
  messagingTokens?: string[];
  language?: string;
};

export type UserMessagingProfile = {
  tokens: string[];
  language?: string;
};

const collection = () => admin.firestore().collection('users');

export const getUserMessagingProfile = async (
  userId: string
): Promise<UserMessagingProfile | null> => {
  const snapshot = await collection().doc(userId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as UserDocument;
  const tokens = data.messagingTokens ?? [];

  if (!tokens.length) {
    return { tokens: [], language: data.language };
  }

  return {
    tokens,
    language: data.language
  };
};
