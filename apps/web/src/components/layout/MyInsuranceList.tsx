import { useState } from 'react';
import { useGetInsurances, useDeleteInsurance } from '../../api/useInsuranceQueries';
import { ShieldCheck, ChevronRight, Activity, Car, HeartPulse, Umbrella, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function MyInsuranceList() {
  const { data: insurances = [] } = useGetInsurances();
  const { mutate: deleteInsurance } = useDeleteInsurance();
  const setEditingProductId = useAppStore(state => state.setEditingProductId);
  const [filter, setFilter] = useState<string>('전체');

  const categories = ['전체', '실비', '암/건강', '자동차', '종신', '기타'];

  const getCategoryIcon = (category: string) => {
    if (category.includes('실비') || category.includes('의료')) return Umbrella;
    if (category.includes('자동차')) return Car;
    if (category.includes('암') || category.includes('건강')) return Activity;
    if (category.includes('종신')) return HeartPulse;
    return ShieldCheck;
  };

  const filteredInsurances = insurances.filter(ins => {
    if (filter === '전체') return true;
    if (filter === '기타') {
      return !['실비', '암/건강', '자동차', '종신'].some(c => ins.category.includes(c));
    }
    return ins.category.includes(filter) || (filter === '암/건강' && (ins.category.includes('암') || ins.category.includes('건강')));
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('정말 이 보험을 삭제하시겠습니까?')) {
      deleteInsurance(id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Filter */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto shrink-0 border-b border-gray-100/60 hide-scrollbar">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all ${
              filter === c 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {filteredInsurances.length > 0 ? (
          filteredInsurances.map((ins) => {
            const Icon = getCategoryIcon(ins.category);
            return (
              <div 
                key={ins.id} 
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3 relative"
                onClick={() => setEditingProductId(ins.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-50 text-indigo-600 text-[11px] font-bold px-2 py-1 rounded-md">
                    {ins.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      aria-label="삭제"
                      onClick={(e) => handleDelete(e, ins.id.toString())}
                      className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-gray-500" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-gray-500">{ins.institution}</span>
                    <span className="text-[15px] font-bold text-gray-900 line-clamp-1">{ins.name}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-end gap-1 mt-1 pt-3 border-t border-gray-50">
                  <span className="text-[20px] font-extrabold text-gray-900 tracking-tight">
                    {ins.monthlyPayment.toLocaleString()}
                  </span>
                  <span className="text-[13px] font-bold text-gray-500">원/월</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 mt-10">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-[14px] font-bold text-gray-500">
              {filter === '전체' ? '등록된 보험이 없습니다' : '해당 카테고리의 보험이 없습니다'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
