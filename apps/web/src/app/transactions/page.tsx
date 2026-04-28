import { PaymentList } from '@/components/payments/PaymentList';
import { CreatePaymentForm } from '@/components/payments/CreatePaymentForm';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Transactions</h1>
        <CreatePaymentForm />
      </div>
      <PaymentList />
    </div>
  );
}
