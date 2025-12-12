import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Import, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ApiHeader, ApiMethod, ApiTemplate, ApiQueryParam } from '../types';
import JsonEditor from './JsonEditor';
import Modal from './Modal';
import { isValidJson, parseCurl } from '../utils/curlParser';
import { buildUrlWithParams, parseQueryParamsFromUrl } from '../utils/urlHelpers';

interface TemplateBuilderProps {
  onSave: (template: ApiTemplate) => void;
  onCancel: () => void;
  templateToEdit?: ApiTemplate | null;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ onSave, onCancel, templateToEdit }) => {
  const [name, setName] = useState('');
  const [method, setMethod] = useState<ApiMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<ApiHeader[]>([]);
  const [queryParams, setQueryParams] = useState<ApiQueryParam[]>([]);
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState<'params' | 'headers'>('params');
  
  const [curlModalOpen, setCurlModalOpen] = useState(false);
  const [curlInput, setCurlInput] = useState('');
  const [curlError, setCurlError] = useState<string | null>(null);

  const isEditing = !!templateToEdit;

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name);
      setMethod(templateToEdit.method);
      setUrl(templateToEdit.url);
      setHeaders(templateToEdit.headers);
      setQueryParams(templateToEdit.queryParams);
      setBody(templateToEdit.body);
    }
  }, [templateToEdit]);

  const methods: ApiMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  // When URL changes manually, update the params table
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    
    if (newUrl.includes('?')) {
        const extractedParams = parseQueryParamsFromUrl(newUrl);
        const schemaParams = extractedParams.map(p => ({ ...p, value: '' }));
        setQueryParams(schemaParams);
    } else {
        if (queryParams.length > 0) setQueryParams([]);
    }
  };

  const updateQueryParam = (id: string, field: keyof ApiQueryParam, value: string) => {
    const updatedParams = queryParams.map(p => p.id === id ? { ...p, [field]: value } : p);
    setQueryParams(updatedParams);
    const newUrl = buildUrlWithParams(url, updatedParams);
    setUrl(newUrl);
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { id: crypto.randomUUID(), key: '', value: '' }]);
  };

  const removeQueryParam = (id: string) => {
    const updatedParams = queryParams.filter(p => p.id !== id);
    setQueryParams(updatedParams);
    const newUrl = buildUrlWithParams(url, updatedParams);
    setUrl(newUrl);
  };

  const addHeader = () => {
    setHeaders([...headers, { id: crypto.randomUUID(), key: '', value: '', isSecret: false }]);
  };

  const updateHeader = (id: string, field: keyof ApiHeader, value: string | boolean) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const handleImportCurl = () => {
    const result = parseCurl(curlInput);
    if (!result) {
        setCurlError("Invalid cURL command or parsing failed.");
        return;
    }

    setMethod(result.method);
    setUrl(result.url);
    const extractedParams = parseQueryParamsFromUrl(result.url);
    const schemaParams = extractedParams.map(p => ({ ...p, value: '' }));
    setQueryParams(schemaParams);
    const schemaHeaders = result.headers.map(h => ({ ...h, value: '' }));
    setHeaders(schemaHeaders);
    
    if (result.body) {
        if (isValidJson(result.body)) {
            setBody(JSON.stringify(JSON.parse(result.body), null, 2));
        } else {
             setBody(result.body);
        }
    }
    setCurlModalOpen(false);
    setCurlInput('');
    setCurlError(null);
  };

  const handleSave = () => {
    if (!name.trim() || !url.trim()) {
        alert("Name and URL are required");
        return;
    }
    if (body.trim() && !isValidJson(body)) {
        alert("Please correct the JSON body before saving.");
        return;
    }

    const newTemplate: ApiTemplate = {
        id: isEditing ? templateToEdit.id : crypto.randomUUID(),
        name,
        method,
        url,
        headers, 
        queryParams,
        body,
        createdAt: isEditing ? templateToEdit.createdAt : Date.now()
    };
    onSave(newTemplate);
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
             <ArrowLeft size={24}/>
          </button>
          <div>
            <h1 className="text-[32px] font-medium text-dark-gray tracking-tight">{isEditing ? 'Edit Template' : 'Create Template'}</h1>
            <p className="text-gray-500 mt-1">Configure your API request blueprint.</p>
          </div>
        </div>
        <div className="flex gap-3 self-end">
            <button 
                onClick={() => setCurlModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-dark-gray rounded-lg border border-border-gray transition-colors text-sm font-medium"
            >
                <Import size={16} />
                Import cURL
            </button>
            <button 
                onClick={onCancel}
                className="px-4 py-2 text-gray-500 hover:text-dark-gray transition-colors text-sm font-medium"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                disabled={body.trim() !== '' && !isValidJson(body)}
                className="flex items-center gap-2 px-6 py-2 bg-woopi-blue hover:bg-dark-blue disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm font-medium"
            >
                <Save size={18} />
                {isEditing ? 'Update Template' : 'Save Template'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-border-gray rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-medium text-dark-gray mb-4">Request Details</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-gray mb-1.5">Template Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., User OCR Processing" 
                            className="w-full bg-white border border-border-gray rounded-lg px-4 py-2.5 text-dark-gray focus:ring-2 focus:ring-woopi-blue/50 focus:border-woopi-blue outline-none transition-all"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="w-36 flex-shrink-0">
                            <label className="block text-sm font-medium text-dark-gray mb-1.5">Method</label>
                            <select 
                                value={method}
                                onChange={(e) => setMethod(e.target.value as ApiMethod)}
                                className="w-full bg-white border border-border-gray rounded-lg px-3 py-2.5 text-dark-gray focus:ring-2 focus:ring-woopi-blue/50 focus:border-woopi-blue outline-none appearance-none font-mono"
                            >
                                {methods.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-dark-gray mb-1.5">Endpoint URL</label>
                            <input 
                                type="text" 
                                value={url}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                placeholder="https://api.example.com/v1/resource" 
                                className="w-full bg-white border border-border-gray rounded-lg px-4 py-2.5 text-dark-gray focus:ring-2 focus:ring-woopi-blue/50 focus:border-woopi-blue font-mono text-sm outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-border-gray rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-border-gray">
                    <button 
                        onClick={() => setActiveTab('params')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'params' ? 'text-woopi-blue border-b-2 border-woopi-blue font-semibold' : 'text-gray-500 hover:text-dark-gray'}`}
                    >
                        Query Params
                    </button>
                    <button 
                        onClick={() => setActiveTab('headers')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'headers' ? 'text-woopi-blue border-b-2 border-woopi-blue font-semibold' : 'text-gray-500 hover:text-dark-gray'}`}
                    >
                        Headers
                    </button>
                </div>

                <div className="p-6 min-h-[300px]">
                    {activeTab === 'params' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base font-medium text-dark-gray">Query Parameters</h3>
                                <button onClick={addQueryParam} className="text-sm flex items-center gap-1 text-woopi-blue hover:text-dark-blue font-medium">
                                    <Plus size={14} /> Add Param
                                </button>
                            </div>
                            {queryParams.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-sm italic border border-dashed border-border-gray rounded-lg">
                                    No query parameters. Add one or type in the URL.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {queryParams.map((param) => (
                                        <div key={param.id} className="flex items-center gap-2 group">
                                            <input 
                                                placeholder="Key"
                                                value={param.key}
                                                onChange={(e) => updateQueryParam(param.id, 'key', e.target.value)}
                                                className="flex-1 bg-white border border-border-gray rounded px-3 py-2 text-sm text-dark-gray font-mono focus:border-woopi-blue outline-none"
                                            />
                                            <button 
                                                onClick={() => removeQueryParam(param.id)}
                                                className="p-2 text-gray-400 hover:text-error transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'headers' && (
                        <div className="animate-fade-in">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base font-medium text-dark-gray">Request Headers</h3>
                                <button onClick={addHeader} className="text-sm flex items-center gap-1 text-woopi-blue hover:text-dark-blue font-medium">
                                    <Plus size={14} /> Add Header
                                </button>
                            </div>
                            {headers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-sm italic border border-dashed border-border-gray rounded-lg">
                                    No headers configured.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {headers.map((header) => (
                                        <div key={header.id} className="flex items-center gap-3 group">
                                            <div className="flex-1">
                                                <input 
                                                    placeholder="Header Name"
                                                    value={header.key}
                                                    onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                                                    className="w-full bg-white border border-border-gray rounded px-3 py-2 text-sm text-dark-gray font-mono focus:border-woopi-blue outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox"
                                                    id={`secret-${header.id}`}
                                                    checked={header.isSecret}
                                                    onChange={(e) => updateHeader(header.id, 'isSecret', e.target.checked)}
                                                    className="w-4 h-4 rounded border-border-gray text-woopi-blue focus:ring-offset-0 focus:ring-1 focus:ring-woopi-blue bg-gray-100 cursor-pointer"
                                                />
                                                <label htmlFor={`secret-${header.id}`} className="text-sm text-dark-gray font-medium cursor-pointer select-none">
                                                    Secret
                                                </label>
                                            </div>
                                            <button 
                                                onClick={() => removeHeader(header.id)}
                                                className="p-2 text-gray-400 hover:text-error transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 h-[600px] lg:h-auto flex flex-col">
            <div className="bg-white border border-border-gray rounded-xl p-1 flex-1 flex flex-col shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border-gray bg-white">
                    <h3 className="text-xl font-medium text-dark-gray">Request Body</h3>
                    <p className="text-sm text-gray-500 mt-1">Supports {'{{variables}}'}</p>
                </div>
                <div className="flex-1 relative">
                    <JsonEditor 
                        value={body} 
                        onChange={setBody} 
                        className="h-full border-0 rounded-none bg-white"
                    />
                </div>
            </div>
        </div>
      </div>

      <Modal isOpen={curlModalOpen} onClose={() => setCurlModalOpen(false)} title="Import from cURL">
         <div className="space-y-4">
             <p className="text-sm text-gray-500">Paste your cURL command below. We will extract the method, URL, headers, and JSON body.</p>
             <textarea 
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                className="w-full h-64 bg-white border border-border-gray rounded-lg p-4 font-mono text-xs text-dark-gray focus:ring-2 focus:ring-woopi-blue outline-none resize-none"
                placeholder="curl -X POST https://api.example.com/data -H 'Content-Type: application/json' -d '{...}'"
             />
             {curlError && (
                 <div className="text-error text-sm bg-error/10 p-3 rounded border border-error/20">
                     {curlError}
                 </div>
             )}
             <div className="flex justify-end gap-3 pt-2">
                 <button 
                    onClick={() => setCurlModalOpen(false)} 
                    className="px-4 py-2 text-gray-500 hover:text-dark-gray font-medium"
                 >
                     Cancel
                 </button>
                 <button 
                    onClick={handleImportCurl} 
                    className="px-4 py-2 bg-woopi-blue hover:bg-dark-blue text-white rounded-lg font-medium"
                 >
                     Import
                 </button>
             </div>
         </div>
      </Modal>
    </div>
  );
};

export default TemplateBuilder;