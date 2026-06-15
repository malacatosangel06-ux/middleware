import type { Request, Response, NextFunction } from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { requireApiKey } from './auth.js';

describe('requireApiKey', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    req = {
      headers: {},
    };

    res = {
      status: statusMock as unknown as Response['status'],
    };

    next = jest.fn();
  });

  it('responde 401 cuando el header x-api-key está ausente', () => {
    req.headers = {};

    requireApiKey(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'API key inválida o ausente' });
    expect(next).not.toHaveBeenCalled();
  });

  it('responde 401 cuando la clave es incorrecta', () => {
    req.headers = { 'x-api-key': 'clave-equivocada' };

    requireApiKey(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'API key inválida o ausente' });
    expect(next).not.toHaveBeenCalled();
  });

  it('llama a next() sin emitir respuesta cuando la clave es válida', () => {
    req.headers = { 'x-api-key': 'secreto-demo' };

    requireApiKey(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });
});
