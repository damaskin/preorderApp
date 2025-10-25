export type BranchDocument = {
  name: string;
  partnerId: string;
  telegramChatId?: number;
  telegramUserId?: number;
};

export type BranchRecord = BranchDocument & {
  id: string;
};
