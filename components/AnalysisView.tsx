import React from 'react';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalysisViewProps {
  result: AnalysisResult;
  fileUrl: string;
  fileType: 'video' | 'image' | 'unknown';
  onReset: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, fileUrl, fileType, onReset }) => {
  const data = [
    { name: '覆盖区域', value: result.screenCoverage === 'Full Screen' || result.screenCoverage === '全屏' ? 100 : result.screenCoverage.includes('3/4') ? 75 : result.screenCoverage.includes('2/4') ? 50 : 25 },
    { name: '空白区域', value: result.screenCoverage === 'Full Screen' || result.screenCoverage === '全屏' ? 0 : result.screenCoverage.includes('3/4') ? 25 : result.screenCoverage.includes('2/4') ? 50 : 75 },
  ];

  const COLORS = ['#8b5cf6', '#1e293b'];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Media Preview */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="w-full aspect-square bg-black rounded-xl border border-slate-700 overflow-hidden relative shadow-lg">
            {fileType === 'video' ? (
              <video 
                src={fileUrl} 
                className="w-full h-full object-contain" 
                controls 
                autoPlay 
                loop 
                muted // Muted by default to avoid annoyance, user can unmute
              />
            ) : (
              <img src={fileUrl} alt="Gift Preview" className="w-full h-full object-contain" />
            )}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-mono text-white/80">
               预览模式
            </div>
          </div>
          
          {/* Main Price Card (Mobile: stacked, Desktop: moved to right, but here we can put summary) */}
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
             <div className="relative z-10 text-center md:text-left">
               <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">建议定价</h3>
               <div className="flex flex-col gap-1">
                 <div className="flex items-baseline justify-center md:justify-start gap-2">
                   <span className="text-3xl font-bold text-yellow-400 drop-shadow-sm">
                     {result.suggestedDiamonds.toLocaleString()}
                   </span>
                   <span className="text-yellow-400/80 text-sm font-medium">钻石</span>
                 </div>
                 <div className="text-slate-400 text-sm">
                   约 <span className="text-white font-semibold">${result.suggestedPriceUsd} USD</span>
                 </div>
               </div>
                <div className="mt-4 flex justify-center md:justify-start">
                 <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                   result.suggestedLevel >= 4 ? 'bg-orange-500/20 border-orange-500 text-orange-200' :
                   result.suggestedLevel === 3 ? 'bg-green-500/20 border-green-500 text-green-200' :
                   'bg-blue-500/20 border-blue-500 text-blue-200'
                 }`}>
                   等级 {result.suggestedLevel}
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Right Column: Data & Specs */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Specs Grid */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h4 className="text-slate-400 text-xs uppercase font-bold mb-4">检测规格</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                  <span className="text-slate-300">时长</span>
                  <span className="font-mono text-white bg-slate-700 px-2 py-0.5 rounded text-sm">{result.estimatedDuration}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                  <span className="text-slate-300">转场数</span>
                  <span className="font-mono text-white bg-slate-700 px-2 py-0.5 rounded text-sm">{result.transitionCount}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                  <span className="text-slate-300">屏占比</span>
                  <span className="font-mono text-white bg-slate-700 px-2 py-0.5 rounded text-sm">{result.screenCoverage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">复杂度</span>
                  <span className="font-mono text-white bg-slate-700 px-2 py-0.5 rounded text-sm">{result.visualComplexity}</span>
                </div>
              </div>
            </div>

            {/* Visual Chart */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center relative min-h-[200px]">
               <h4 className="absolute top-5 left-5 text-slate-400 text-xs uppercase font-bold">屏幕覆盖率</h4>
               <div className="h-32 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
               </div>
               <div className="text-xs text-slate-500 mt-1 text-center">预估视觉权重</div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex-1">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AI 定价分析理由
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {result.reasoning}
            </p>
            
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                 {result.warnings.map((warn, i) => (
                   <div key={i} className="text-yellow-500 text-sm flex items-start gap-2">
                     <span className="mt-1">⚠️</span> {warn}
                   </div>
                 ))}
              </div>
            )}
          </div>
          
           <div className="flex justify-end">
            <button
              onClick={onReset}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              移除/关闭报告
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;