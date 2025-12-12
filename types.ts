import React from 'react';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiHeader {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

export interface ApiQueryParam {
  id: string;
  key: string;
  value: string;
}

export interface ApiTemplate {
  id: string;
  name: string;
  method: ApiMethod;
  url: string;
  headers: ApiHeader[];
  queryParams: ApiQueryParam[];
  body: string; // Stored as string to preserve formatting, parsed for validation
  createdAt: number;
}

export type DependencyType = 'OCR' | 'Prompt' | 'AI';

export interface CurlParseResult {
  method: ApiMethod;
  url: string;
  headers: ApiHeader[];
  body: string;
}

export interface NavigationItem {
  id: 'builder' | 'executor';
  label: string;
  icon: React.ReactNode;
}