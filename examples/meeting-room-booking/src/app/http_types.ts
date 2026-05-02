import type { Connect } from 'vite';

export type HttpRequest = Connect.IncomingMessage;

export type HttpResponse = {
  setHeader: (name: string, value: string) => void;
  end: (chunk?: string) => void;
};
