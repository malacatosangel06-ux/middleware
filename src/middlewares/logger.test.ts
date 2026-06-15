import type { Request, Response, NextFunction } from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { requestLogger } from './logger.js';

describe('requestLogger', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let finishCallback: () => void;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/health',
    };

    res = {
      statusCode: 200,
      on: jest.fn((event: string, cb: () => void) => {
        if (event === 'finish') {
          finishCallback = cb;
        }
        return res as Response;
      }),
    };

    next = jest.fn();
  });

  it('llama a next() al recibir una petición', () => {
    requestLogger(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('registra el método y la ruta correctamente al finalizar la respuesta', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    requestLogger(req as Request, res as Response, next);

    // Simula el evento 'finish' de la respuesta
    finishCallback();

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    const logMessage = consoleSpy.mock.calls[0]?.[0] as string;
    expect(logMessage).toContain('GET');
    expect(logMessage).toContain('/health');
    expect(logMessage).toContain('200');

    consoleSpy.mockRestore();
  });
});
