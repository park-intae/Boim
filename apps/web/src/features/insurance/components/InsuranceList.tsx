import { useInsuranceProducts } from '../hooks/useInsuranceProducts';

export function InsuranceList() {
  const { data, isLoading, isError } = useInsuranceProducts();

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>에러가 발생했습니다.</div>;

  const products = data?.data || [];

  if (products.length === 0) {
    return <div className="text-gray-500 bg-white p-8 rounded-2xl border border-gray-100 text-center">등록된 보험 상품이 없습니다.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <div key={String(product.id)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-medium text-brand-primary mb-1">{product.category}</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
          <div className="text-gray-500 text-sm mb-4">{product.institution}</div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <span className="text-sm text-gray-500">월 납입액</span>
            <span className="font-bold text-gray-800">{product.monthlyPayment.toLocaleString()}원</span>
          </div>
        </div>
      ))}
    </div>
  );
}
