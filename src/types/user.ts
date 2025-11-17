export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  credits: number;
  subscriptionTier: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: "debit" | "credit";
  description: string;
  messageId?: string;
  createdAt: string;
}
