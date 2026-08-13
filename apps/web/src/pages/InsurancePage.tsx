import { InsuranceList } from '../features/insurance/components/InsuranceList';

export function InsurancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">가입 현황</h1>
        <button className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          + 새 보험 등록
        </button>
      </div>
      <InsuranceList />
    </div>
  );
}
