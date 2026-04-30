import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreatePaymentForm } from '@/components/payments/CreatePaymentForm';
import * as apiModule from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
  },
  getApiErrorMessage: jest.requireActual('@/lib/api').getApiErrorMessage,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('CreatePaymentForm', () => {
  it('shows generic message when payment creation fails with sensitive provider error', async () => {
    (apiModule.api.post as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {
          statusCode: 401,
          message: 'Invalid API Key provided: sk_test_****************XXXX',
        },
      },
      message: 'Request failed with status code 401',
    });

    render(<CreatePaymentForm />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /new payment/i }));

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '1000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    expect(
      await screen.findByText(/something went wrong please try again/i),
    ).toBeTruthy();
  });
});
