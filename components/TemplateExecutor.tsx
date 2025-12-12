import React, { useEffect, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { ApiHeader, ApiTemplate, ApiQueryParam, DependencyType } from '../types';
import JsonEditor from './JsonEditor';
import { isValidJson } from '../utils/curlParser';
import { buildUrlWithParams } from '../utils/urlHelpers';

interface TemplateExecutorProps {
  template: ApiTemplate;
}

const TemplateExecutor: React.FC<TemplateExecutorProps> = ({ template }) => {
  // Working state (cloned from template)
  const [method, setMethod] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [displayUrl, setDisplayUrl] = useState('');
  const [headers, setHeaders] = useState<ApiHeader[]>([]);
  const [queryParams, setQueryParams] = useState<ApiQueryParam[]>([]);
  const [body, setBody] = useState('');
  
  const [dependencies, setDependencies] = useState<DependencyType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'headers'>('params');

  useEffect(() => {
    if (template) {
        setMethod(template.method);
        setBaseUrl(template.url);
        setDisplayUrl(template.url);
        
        setHeaders(template.headers.map(h => ({...h, value: ''}))); // Clear values for execution
        setBody(template.body);
        
        if (template.queryParams && template.queryParams.length > 0) {
             setQueryParams(template.queryParams.map(p => ({...p, value: ''}))); // Clear values
        } else {
             setQueryParams([]);
        }

        setResponse(null);
        setDependencies([]);
        setActiveTab(template.queryParams && template.queryParams.length > 0 ? 'params' : 'headers');
    }
  }, [template]);

  // Update Display URL when params change
  useEffect(() => {
      if (baseUrl) {
          const newUrl = buildUrlWithParams(baseUrl, queryParams);
          setDisplayUrl(newUrl);
      }
  }, [baseUrl, queryParams]);

  const toggleDependency = (dep: DependencyType) => {
    setDependencies(prev => 
        prev.includes(dep) ? prev.filter(d => d !== dep) : [...prev, dep]
    );
  };

  const updateHeaderValue = (id: string, newVal: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, value: newVal } : h));
  };

  const updateParamValue = (id: string, newVal: string) => {
    // FIX: Corrected a typo where `h` was used instead of `p`.
    setQueryParams(queryParams.map(p => p.id === id ? { ...p, value: newVal } : p));
  };

  const executeApi = () => {
      if (!isValidJson(body) && body.trim() !== '') {
          alert("Invalid JSON body");
          return;
      }
      setIsLoading(true);
      setResponse(null);

      // Mock Execution
      setTimeout(() => {
          setIsLoading(false);
          const mockRes = {
              status: 200,
              message: "Execution Successful",
              dependencies_used: dependencies,
              received_data: {
                  method,
                  url: displayUrl,
                  headers: headers.reduce((acc, h) => ({...acc, [h.key]: h.value}), {}),
                  query_params: queryParams.reduce((acc, p) => ({...acc, [p.key]: p.value}), {}),
                  body: body.trim() ? JSON.parse(body) : null
              },
              timestamp: new Date().toISOString()
          };
          setResponse(JSON.stringify(mockRes, null, 2));
      }, 1200);
  };

  return (
    <div className="bg-white/50 p-3 rounded-b-lg border-t border-border-gray animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-dark-gray">Dependencies</div>
                <div className="flex gap-2">
                    {(['OCR', 'Prompt', 'AI'] as DependencyType[]).map(dep => (
                        <button
                            key={dep}
                            onClick={() => toggleDependency(dep)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                dependencies.includes(dep)
                                ? 'bg-woopi-blue text-white border-woopi-blue'
                                : 'bg-white text-gray-600 border-border-gray hover:border-gray-300'
                            }`}
                        >
                            {dep}
                        </button>
                    ))}
                </div>
            </div>
            
            <button 
                onClick={executeApi}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-woopi-blue hover:bg-dark-blue text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Play size={16} fill="currentColor" />}
                EXECUTE
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Editor */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                    <div className="bg-gray-100 border border-border-gray rounded-lg px-3 py-2 text-sm font-mono text-dark-gray font-medium">
                        {method}
                    </div>
                    <div className="flex-1 bg-gray-100 border border-border-gray rounded-lg px-4 py-2 text-sm font-mono text-gray-600 truncate" title={displayUrl}>
                        {displayUrl}
                    </div>
                </div>

                <div className="bg-white border border-border-gray rounded-xl overflow-hidden">
                     <div className="flex border-b border-border-gray">
                        <button 
                            onClick={() => setActiveTab('params')}
                            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === 'params' ? 'text-woopi-blue bg-light-blue/50' : 'text-gray-500 hover:text-dark-gray'}`}
                        >
                            Params ({queryParams.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('headers')}
                            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === 'headers' ? 'text-woopi-blue bg-light-blue/50' : 'text-gray-500 hover:text-dark-gray'}`}
                        >
                            Headers ({headers.length})
                        </button>
                    </div>
                    
                    <div className="p-4 max-h-48 overflow-y-auto">
                        {activeTab === 'params' && (
                            <div className="space-y-2">
                                {queryParams.length === 0 ? (
                                    <p className="text-gray-500 text-xs italic text-center py-2">No query parameters</p>
                                ) : (
                                    queryParams.map(p => (
                                        <div key={p.id} className="grid grid-cols-[1fr_2fr] gap-2 items-center">
                                            <span className="text-xs font-mono text-gray-500 truncate text-right pr-2">{p.key}</span>
                                            <input 
                                                type="text"
                                                value={p.value}
                                                onChange={(e) => updateParamValue(p.id, e.target.value)}
                                                className="w-full bg-white border border-border-gray rounded px-2 py-1.5 text-xs text-dark-gray font-mono focus:border-woopi-blue outline-none"
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {activeTab === 'headers' && (
                            <div className="space-y-2">
                                {headers.length === 0 ? (
                                     <p className="text-gray-500 text-xs italic text-center py-2">No headers</p>
                                ) : (
                                    headers.map(h => (
                                        <div key={h.id} className="grid grid-cols-[1fr_2fr] gap-2 items-center">
                                            <span className="text-xs font-mono text-gray-500 truncate text-right pr-2">{h.key}:</span>
                                            <input 
                                                type={h.isSecret ? "password" : "text"}
                                                value={h.value}
                                                onChange={(e) => updateHeaderValue(h.id, e.target.value)}
                                                className="w-full bg-white border border-border-gray rounded px-2 py-1.5 text-xs text-dark-gray font-mono focus:border-woopi-blue outline-none"
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-white border border-border-gray rounded-xl p-1 flex flex-col min-h-[200px]">
                    <div className="px-4 py-2 border-b border-border-gray bg-white">
                        <h4 className="text-sm font-medium text-dark-gray">Request Body</h4>
                    </div>
                    <JsonEditor 
                        value={body} 
                        onChange={setBody} 
                        className="flex-1 rounded-none border-0 bg-white"
                    />
                </div>
            </div>

            {/* Right: Response */}
            <div className="flex flex-col gap-4">
                 <div className="bg-white border border-border-gray rounded-xl p-1 flex-1 flex flex-col shadow-sm relative overflow-hidden min-h-[300px]">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-woopi-blue to-transparent opacity-0 transition-opacity duration-300" style={{ opacity: isLoading ? 1 : 0 }}></div>
                     <div className="px-4 py-2 border-b border-border-gray flex justify-between items-center">
                         <h4 className="text-sm font-medium text-dark-gray">Response Output</h4>
                         {response && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">JSON</span>}
                     </div>
                     <div className="flex-1 p-4 font-mono text-xs overflow-auto">
                         {isLoading ? (
                             <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                                 <Loader2 className="animate-spin" size={24} />
                                 <span>Processing Request...</span>
                             </div>
                         ) : response ? (
                             <pre className="text-dark-gray whitespace-pre-wrap">{response}</pre>
                         ) : (
                             <div className="text-gray-500 italic h-full flex items-center justify-center">
                                 Response will appear here
                             </div>
                         )}
                     </div>
                 </div>
            </div>

        </div>
    </div>
  );
};

export default TemplateExecutor;