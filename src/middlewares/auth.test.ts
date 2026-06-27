import type { Request, Response, NextFunction } from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { requireJwt } from './auth.js';
import { createHmac } from 'crypto';

const SECRET = 'secreto-demo-pe23';

function makeToken(alg: string, payload: object, sign = true): string {
  const base64url = (s: string) =>
    Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const h = base64url(JSON.stringify({ alg, typ: 'JWT' }));
  const p = base64url(JSON.stringify(payload));

  if (!sign) return `${h}.${p}.`;

  const sig = createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${sig}`;
}

describe('requireJwt', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock   = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    req  = { headers: {} };
    res  = { status: statusMock as unknown as Response['status'] };
    next = jest.fn();
  });

  it('responde 401 cuando el header Authorization está ausente', () => {
    requireJwt(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('responde 401 con firma invalida', () => {
    req.headers = { authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.FIRMA_INVALIDA' };
    requireJwt(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Firma invalida' });
    expect(next).not.toHaveBeenCalled();
  });

  it('responde 401 con alg:none', () => {
    const token = makeToken('none', { sub: 'x' }, false);
    req.headers = { authorization: `Bearer ${token}` };
    requireJwt(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Algoritmo no permitido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('llama a next() con token valido', () => {
    const token = makeToken('HS256', {
      sub: '20251042',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    req.headers = { authorization: `Bearer ${token}` };
    requireJwt(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(statusMock).not.toHaveBeenCalled();
  });
});