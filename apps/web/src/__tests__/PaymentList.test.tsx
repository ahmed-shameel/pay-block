/**
 * Unit tests for the PaymentList component.
 * We mock the API and react-query so no network calls are made.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentList } from '@/components/payments/PaymentList';
import * as apiModule from '@/lib/api';
import { Payment } from '@/types';

const mockPayments: Payment[] = [
  {
    id: 'aaaa-bbbb-cccc-dddd',
    userId: 'user-1',
    amount: '1000',
    currency: 'usd',
    method: 'stripe',
    status: 'succeeded',
    providerTxId: 'pi_test',
    blockchainTxHash: null,
    metadata: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

jest.mock('@/lib/api', () => ({
  api: { get: jest.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('PaymentList', () => {
  it('renders a table row for each payment', async () => {
    (apiModule.api.get as jest.Mock).mockResolvedValue(mockPayments);

    render(<PaymentList />, { wrapper });

    // Wait for data to appear
    const row = await screen.findByText('1000');
    expect(row).toBeInTheDocument();
    expect(screen.getByText('succeeded')).toBeInTheDocument();
  });

  it('shows empty state when there are no payments', async () => {
    (apiModule.api.get as jest.Mock).mockResolvedValue([]);

    render(<PaymentList />, { wrapper });

    expect(await screen.findByText(/no payments yet/i)).toBeInTheDocument();
  });
});
