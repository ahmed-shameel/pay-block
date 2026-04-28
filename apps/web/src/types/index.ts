export interface Payment {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  method: 'stripe' | 'crypto';
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  providerTxId: string | null;
  blockchainTxHash: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  creatorId: string;
  beneficiaryRef: string;
  type: 'escrow' | 'milestone' | 'subscription';
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'disputed';
  amount: string;
  currency: string;
  config: Record<string, unknown> | null;
  onChainAddress: string | null;
  deployTxHash: string | null;
  createdAt: string;
  updatedAt: string;
}
