import { useGetInsurances } from '../../api/useInsuranceQueries';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, ShieldCheck, HeartPulse, Car, Umbrella } from 'lucide-react';

export function PremiumAnalysis() {
  const { data: insurances = [] } = useGetInsurances();

  const totalPayment = insurances.reduce((acc, curr) => acc + curr.monthlyPayment, 0);

  // 데이터 가공 로직
  const categoryMap: Record<string, number> = {
    '실비': 0,
    '암/건강': 0,
    '자동차': 0,
    '종신': 0,
    '기타': 0,
  };

  insurances.forEach(ins => {
    if (ins.category.includes('실비') || ins.category.includes('의료')) {
      categoryMap['실비'] += ins.monthlyPayment;
    } else if (ins.category.includes('암') || ins.category.includes('건강')) {
      categoryMap['암/건강'] += ins.monthlyPayment;
    } else if (ins.category.includes('자동차')) {
      categoryMap['자동차'] += ins.monthlyPayment;
    } else if (ins.category.includes('종신')) {
      categoryMap['종신'] += ins.monthlyPayment;
    } else {
      categoryMap['기타'] += ins.monthlyPayment;
    }
  });

  const chartData = Object.entries(categoryMap)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-7 py-6 border-b border-gray-100 shrink-0">
        <h3 className="text-[16px] font-bold text-gray-500 mb-1">이번 달 총 납입액</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-[32px] font-extrabold text-gray-900 tracking-tight">
            {totalPayment.toLocaleString()}
          </span>
          <span className="text-[18px] font-bold text-gray-500">원</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
        {chartData.length > 0 ? (
          <>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()}원`, '납입액']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 mt-10">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-[14px] font-bold text-gray-500">
              분석할 데이터가 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
