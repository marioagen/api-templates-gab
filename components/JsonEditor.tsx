import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { isValidJson } from '../utils/curlParser';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, readOnly = false, className = '' }) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!value.trim()) {
        setIsValid(true);
        setErrorMsg(null);
        return;
    }

    if (isValidJson(value)) {
        setIsValid(true);
        setErrorMsg(null);
    } else {
        setIsValid(false);
        // Try to get a real error message from strict parse
        try {
            JSON.parse(value);
        } catch(e: any) {
            setErrorMsg(e.message || 'Invalid JSON syntax');
        }
    }
  }, [value]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="relative flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className={`w-full h-full p-4 font-mono text-sm bg-white border rounded-md resize-none focus:outline-none focus:ring-2 transition-all
            ${isValid 
              ? 'border-border-gray focus:border-woopi-blue focus:ring-woopi-blue/20' 
              : 'border-error/50 focus:border-error focus:ring-error/20'}
            ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
            text-dark-gray placeholder-gray-400
          `}
          placeholder="{\n  &quot;key&quot;: {{variable}}\n}"
        />
        <div className="absolute bottom-4 right-4 pointer-events-none">
           {value.trim() && (
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md shadow-lg ${
                isValid ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'
             }`}>
                {isValid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{isValid ? 'Valid Template' : 'Invalid Syntax'}</span>
             </div>
           )}
        </div>
      </div>
      {!isValid && errorMsg && (
          <div className="mt-2 text-xs text-error pl-1 font-mono">
              Error: {errorMsg}
          </div>
      )}
    </div>
  );
};

export default JsonEditor;