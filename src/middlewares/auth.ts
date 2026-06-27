import type { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';

const ALLOWED_ALG = 'HS256';
const secret = process.env.JWT_SECRET ?? 'secreto-demo-pe23';

function base64urlDecode(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

export function requireJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token ausente o mal formado' });
    return;
  }

  const token = authHeader.slice(7);
  const parts = token.split('.');

  if (parts.length !== 3) {
    res.status(401).json({ error: 'Token mal formado' });
    return;
  }

  const headerB64   = parts[0] as string;
  const payloadB64  = parts[1] as string;
  const sigReceived = parts[2] as string;

  let header: { alg?: string };
  try {
    header = JSON.parse(base64urlDecode(headerB64));
  } catch {
    res.status(401).json({ error: 'Token mal formado' });
    return;
  }

  if (header.alg !== ALLOWED_ALG) {
    res.status(401).json({ error: 'Algoritmo no permitido' });
    return;
  }

  const expectedSig = createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  const sigReceivedBuf = Buffer.from(sigReceived);
  const expectedSigBuf = Buffer.from(expectedSig);

  if (
    sigReceivedBuf.length !== expectedSigBuf.length ||
    !timingSafeEqual(sigReceivedBuf, expectedSigBuf)
  ) {
    res.status(401).json({ error: 'Firma invalida' });
    return;
  }

  let payload: { exp?: number };
  try {
    payload = JSON.parse(base64urlDecode(payloadB64));
  } catch {
    res.status(401).json({ error: 'Token mal formado' });
    return;
  }

  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    res.status(401).json({ error: 'Token expirado' });
    return;
  }

  next();
}