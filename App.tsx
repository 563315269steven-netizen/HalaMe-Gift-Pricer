import React, { useState, useRef, useEffect } from 'react';
import { analyzeGiftMedia } from './services/geminiService';
import PricingTable from './components/PricingTable';
import AnalysisView from './components/AnalysisView';
import { AnalysisResult, QueueItem } from './types';

const App: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-inject API Key
  const apiKey = process.env.API_KEY || '';

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFiles = (files: FileList | File[]) => {
    const newItems: QueueItem[] = Array.from(files).map(file => ({
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'unknown',
      status: 'idle'
    }));

    setQueue(prev => [...prev, ...newItems]);
    
    // Select the first new item if nothing is selected
    if (!selectedId && newItems.length > 0) {
      setSelectedId(newItems[0].id);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFiles(event.target.files);
    }
    // Reset input to allow selecting same files again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const runBatchAnalysis = async () => {
    if (!apiKey) {
      alert("请配置 API Key");
      return;
    }

    setIsProcessing(true);
    
    const itemsToProcess = queue.filter(item => item.status === 'idle' || item.status === 'error');

    for (const item of itemsToProcess) {
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'analyzing', errorMsg: undefined } : i));
      setSelectedId(item.id); 

      try {
        const result = await analyzeGiftMedia(item.file, apiKey);
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'success', result } : i));
      } catch (err: any) {
        console.error(err);
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', errorMsg: "分析失败" } : i));
      }
    }

    setIsProcessing(false);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQueue(prev => {
      const itemToRemove = prev.find(i => i.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }

      const newQueue = prev.filter(i => i.id !== id);
      if (selectedId === id) {
        setSelectedId(newQueue.length > 0 ? newQueue[0].id : null);
      }
      return newQueue;
    });
  };

  const clearAll = () => {
    // Removed window.confirm to fix potential blocking issues
    // Cleanup memory
    queue.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setQueue([]);
    setSelectedId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedItem = queue.find(i => i.id === selectedId);

  // Derived state
  const pendingCount = queue.filter(i => i.status === 'idle' || i.status === 'error').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-brand-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
              G
            </div>
            <span className="font-bold text-xl tracking-tight text-white">礼物特效定价 <span className="text-brand-400">AI</span></span>
          </div>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            支持批量模式
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Batch Manager & Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* 1. Upload Area (Collapsed or Expanded) */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/30 hover:bg-slate-800/30 hover:border-brand-500/50 transition-all cursor-pointer group text-center
              ${queue.length === 0 ? 'min-h-[300px] flex flex-col items-center justify-center p-8' : 'p-6 flex items-center justify-between'}
            `}
          >
            <div className={`flex items-center gap-4 ${queue.length === 0 ? 'flex-col' : 'flex-row'}`}>
              <div className={`
                rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform
                ${queue.length === 0 ? 'w-16 h-16 mb-4' : 'w-10 h-10'}
              `}>
                <svg className={`${queue.length === 0 ? 'w-8 h-8' : 'w-5 h-5'} text-brand-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className={`font-bold text-white ${queue.length === 0 ? 'text-xl text-center' : 'text-base'}`}>
                  {queue.length === 0 ? '上传礼物文件' : '添加更多文件'}
                </h3>
                <p className={`text-slate-400 ${queue.length === 0 ? 'mb-4' : 'text-xs'}`}>
                  {queue.length === 0 ? '拖拽 MP4, WebM, 或 PNG 文件进行批量定价。' : '拖拽或点击添加至队列。'}
                </p>
              </div>
            </div>
            
            {queue.length === 0 && (
              <button className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg shadow-lg shadow-brand-600/20 transition-all mt-4">
                选择文件
              </button>
            )}

            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="video/*,image/*"
              multiple // ENABLE BATCH
              onChange={handleFileChange}
            />
          </div>

          {/* 2. Batch Toolbar & Queue List */}
          {queue.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col max-h-[500px]">
              
              {/* Toolbar */}
              <div className="p-3 border-b border-slate-700 flex items-center justify-between bg-slate-800/80">
                <div className="text-sm font-medium text-slate-300">
                  队列 ({queue.length}) • {queue.filter(i => i.status === 'success').length} 已完成
                </div>
                <div className="flex items-center gap-2">
                  {pendingCount > 0 && (
                    <button 
                      onClick={runBatchAnalysis}
                      disabled={isProcessing}
                      className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 transition-colors ${
                        isProcessing 
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                          : 'bg-brand-600 hover:bg-brand-500 text-white shadow shadow-brand-600/20'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          分析中...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          开始批量分析
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={clearAll}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto custom-scrollbar">
                {queue.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`
                      flex items-center gap-4 p-3 border-b border-slate-700/50 cursor-pointer transition-colors
                      ${selectedId === item.id ? 'bg-brand-900/20 border-l-2 border-l-brand-500' : 'hover:bg-slate-800/40 border-l-2 border-l-transparent'}
                    `}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded bg-black flex-shrink-0 overflow-hidden border border-slate-700">
                      {item.type === 'video' ? (
                        <video src={item.previewUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      {item.status === 'analyzing' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <svg className="w-5 h-5 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {item.status === 'success' && (
                        <div className="absolute bottom-0 right-0 p-0.5 bg-green-500 text-white rounded-tl-sm">
                           <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-medium truncate ${selectedId === item.id ? 'text-white' : 'text-slate-300'}`}>
                          {item.file.name}
                        </span>
                        {item.result && (
                          <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-1.5 rounded">
                            ${item.result.suggestedPriceUsd}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                         <div className="text-xs text-slate-500">
                           {(item.file.size / 1024 / 1024).toFixed(2)} MB
                           {item.result && ` • 等级 ${item.result.suggestedLevel}`}
                         </div>
                         {item.status === 'error' && (
                           <span className="text-xs text-red-400">分析失败</span>
                         )}
                         {item.status === 'idle' && (
                           <span className="text-xs text-slate-600">等待中</span>
                         )}
                      </div>
                    </div>

                    {/* Action */}
                    <button 
                      onClick={(e) => removeItem(item.id, e)}
                      className="p-1 text-slate-600 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Detailed Results View */}
          {selectedItem && selectedItem.status === 'success' && selectedItem.result && (
             <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm uppercase font-bold tracking-wider">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   分析报告: {selectedItem.file.name}
                </div>
                <AnalysisView 
                  result={selectedItem.result} 
                  fileUrl={selectedItem.previewUrl}
                  fileType={selectedItem.type}
                  onReset={() => {
                    removeItem(selectedItem.id, {} as any);
                  }} 
                />
             </div>
          )}
          
          {selectedItem && selectedItem.status === 'analyzing' && (
             <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
               <div className="text-slate-400">正在分析 <span className="text-white font-medium">{selectedItem.file.name}</span>...</div>
             </div>
          )}

          {selectedItem && selectedItem.status === 'error' && (
             <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
                <div className="text-red-400 text-lg font-bold mb-2">分析失败</div>
                <p className="text-red-200/70 mb-4">
                  {selectedItem.errorMsg || "处理过程中发生未知错误。"}
                </p>
                <button 
                  onClick={() => runBatchAnalysis()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-white"
                >
                  重试失败项
                </button>
             </div>
          )}

          {queue.length > 0 && !selectedItem && (
             <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
                <p className="text-slate-500">请从队列中选择一个文件查看详情。</p>
             </div>
          )}

        </div>

        {/* Right Column: Reference Table */}
        <div className="lg:col-span-4 h-full min-h-[500px] lg:h-[calc(100vh-8rem)] sticky top-24">
          <PricingTable />
        </div>

      </main>
    </div>
  );
};

export default App;