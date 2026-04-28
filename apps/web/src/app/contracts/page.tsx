import { ContractList } from '@/components/contracts/ContractList';
import { CreateContractForm } from '@/components/contracts/CreateContractForm';

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Contracts</h1>
        <CreateContractForm />
      </div>
      <ContractList />
    </div>
  );
}
