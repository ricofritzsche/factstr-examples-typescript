import type { HttpRequest } from './http_types';

export const readJsonBody = async <T>(request: HttpRequest): Promise<T> => {
  let body = '';
  const textDecoder = new TextDecoder();

  for await (const chunk of request) {
    body += typeof chunk === 'string' ? chunk : textDecoder.decode(chunk, { stream: true });
  }

  body += textDecoder.decode();

  return JSON.parse(body) as T;
};
