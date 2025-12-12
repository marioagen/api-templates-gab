import { ApiQueryParam } from '../types';

export const parseQueryParamsFromUrl = (url: string): ApiQueryParam[] => {
  if (!url || !url.includes('?')) return [];

  const queryString = url.split('?')[1];
  if (!queryString) return [];

  return queryString.split('&').map(pair => {
    const [key, ...valueParts] = pair.split('=');
    // Join back in case value has = inside, though simplified
    const value = valueParts.join('=');
    return {
      id: crypto.randomUUID(),
      key: decodeURIComponent(key || ''),
      value: decodeURIComponent(value || '')
    };
  });
};

export const buildUrlWithParams = (baseUrl: string, params: ApiQueryParam[]): string => {
  // Extract base url (remove existing query params)
  const cleanBase = baseUrl.split('?')[0];
  
  const activeParams = params.filter(p => p.key.trim() !== '');
  
  if (activeParams.length === 0) return cleanBase;

  const queryString = activeParams
    .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&');
    
  return `${cleanBase}?${queryString}`;
};