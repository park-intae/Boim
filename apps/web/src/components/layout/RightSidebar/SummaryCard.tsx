interface SummaryCardProps {
  title: string;
  amount: number;
}

export function SummaryCard({ title, amount }: SummaryCardProps) {
  return (
    <div className="mb-4">
      <h3 className="font-bold text-gray-800 text-lg mb-4">{title}</h3>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-transform hover:-translate-y-1">
        <p className="text-sm text-gray-500 mb-1">이번 달 총 납입액</p>
        <p className="text-2xl font-bold text-brand-primary">
          {amount.toLocaleString()}
          <span className="text-lg font-medium text-gray-600 ml-1">원</span>
        </p>
      </div>
    </div>
  );
}
