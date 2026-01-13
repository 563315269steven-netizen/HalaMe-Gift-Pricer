import React from 'react';
import { PRICING_RULES } from '../constants';

const PricingTable: React.FC = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 bg-slate-900/50">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          定价标准
        </h2>
      </div>
      <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 sticky top-0">
            <tr>
              <th scope="col" className="px-3 py-3">等级</th>
              <th scope="col" className="px-3 py-3">规格描述</th>
              <th scope="col" className="px-3 py-3 text-right">参考价格</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_RULES.map((rule, index) => (
              <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="px-3 py-3 font-medium text-slate-200">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                    ${rule.level === 1 ? 'bg-gray-600' : ''}
                    ${rule.level === 2 ? 'bg-blue-600' : ''}
                    ${rule.level === 3 ? 'bg-green-600' : ''}
                    ${rule.level === 4 ? 'bg-orange-600' : ''}
                    ${rule.level === 5 ? 'bg-purple-600' : ''}
                  `}>
                    {rule.level}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium text-white">{rule.duration}</div>
                  <div className="text-xs text-slate-400">{rule.specs}</div>
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <div className="text-yellow-400 font-bold">{rule.priceDiamonds.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">${rule.priceUsd}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 mt-2 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-200">
          <strong>注意:</strong> 如果转场效果相对于时长不足，价格和等级都会相应降低。
        </div>
      </div>
    </div>
  );
};

export default PricingTable;