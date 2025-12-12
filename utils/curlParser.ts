import { ApiHeader, ApiMethod, CurlParseResult } from '../types';

export const parseCurl = (curlCommand: string): CurlParseResult | null => {
  if (!curlCommand || !curlCommand.trim().toLowerCase().startsWith('curl')) {
    return null;
  }

  const result: CurlParseResult = {
    method: 'GET',
    url: '',
    headers: [],
    body: '',
  };

  const args: string[] = [];
  let current = '';
  let inQuote: "'" | '"' | null = null;
  
  for (let i = 0; i < curlCommand.length; i++) {
    const char = curlCommand[i];
    
    if (char === '\\' && i + 1 < curlCommand.length) {
       if (curlCommand[i+1] === '\n') {
           i++; 
           continue; 
       }
       current += curlCommand[i+1];
       i++;
       continue;
    }

    if (inQuote) {
      if (char === inQuote) {
        inQuote = null;
      } else {
        current += char;
      }
    } else {
      if (char === '"' || char === "'") {
        inQuote = char;
      } else if (char === ' ' || char === '\n') {
        if (current.length > 0) {
          args.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
  }
  if (current.length > 0) args.push(current);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('http')) {
      result.url = arg;
      continue;
    }

    if (arg === '-X' || arg === '--request') {
      const next = args[i + 1];
      if (next) {
        result.method = next.toUpperCase() as ApiMethod;
        i++;
      }
    } else if (arg === '-H' || arg === '--header') {
      const next = args[i + 1];
      if (next) {
        const [key, ...valParts] = next.split(':');
        const value = valParts.join(':').trim();
        if (key) {
            result.headers.push({
                id: crypto.randomUUID(),
                key: key.trim(),
                value: value, // We parse it here, but UI might ignore it
                isSecret: false
            });
        }
        i++;
      }
    } else if (arg === '-d' || arg === '--data' || arg === '--data-raw' || arg === '--data-binary') {
      const next = args[i + 1];
      if (next) {
        if (result.method === 'GET') result.method = 'POST';
        result.body = next;
        i++;
      }
    }
  }
  
  if (!result.url) {
      const potentialUrl = args.find(a => a.startsWith('http'));
      if (potentialUrl) result.url = potentialUrl;
  }

  return result;
};

export const isValidJson = (json: string): boolean => {
  if (!json || json.trim() === '') return true;

  // 1. Try standard parse first
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    // 2. Try lenient validation for templates
    // Allows: { "key": {{variable}} } and { "key": "{{variable}}" }
    
    let sanitized = json;

    // Replace quoted variables like "{{ocr}}" with "__VAR__"
    // Handles: "key": "{{value}}"
    sanitized = sanitized.replace(/"\s*\{\{.*?\}\}\s*"/g, '"__VAR__"');

    // Replace unquoted variables like {{ocr}} with "__VAR__"
    // Handles: "key": {{value}}
    sanitized = sanitized.replace(/\{\{.*?\}\}/g, '"__VAR__"');

    try {
        JSON.parse(sanitized);
        return true;
    } catch (e2) {
        return false;
    }
  }
};