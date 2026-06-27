import { describe, it, expect } from 'vitest';

import {
  generateHex,
  generateTraceparent,
  generateTracestate,
  injectTraceHeaders,
  withTraceHeaders,
  isValidTraceparent,
  TRACEPARENT_REGEX,
} from './trace-context.js';

describe('trace-context', () => {
  describe('generateHex', () => {
    it('generates a hex string of the correct length', () => {
      const hex16 = generateHex(16);
      expect(hex16).toHaveLength(32); // 16 bytes = 32 hex chars

      const hex8 = generateHex(8);
      expect(hex8).toHaveLength(16); // 8 bytes = 16 hex chars
    });

    it('produces only lowercase hex characters', () => {
      const hex = generateHex(16);
      expect(hex).toMatch(/^[0-9a-f]+$/);
    });

    it('generates different values on each call', () => {
      const a = generateHex(16);
      const b = generateHex(16);
      expect(a).not.toBe(b);
    });
  });

  describe('generateTraceparent', () => {
    it('returns a valid W3C traceparent format', () => {
      const traceparent = generateTraceparent();
      expect(traceparent).toMatch(TRACEPARENT_REGEX);
    });

    it('starts with version 00', () => {
      const traceparent = generateTraceparent();
      expect(traceparent.startsWith('00-')).toBe(true);
    });

    it('ends with trace-flags 01 (sampled)', () => {
      const traceparent = generateTraceparent();
      expect(traceparent.endsWith('-01')).toBe(true);
    });

    it('has four dash-separated parts', () => {
      const traceparent = generateTraceparent();
      const parts = traceparent.split('-');
      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe('00'); // version
      expect(parts[1]).toHaveLength(32); // trace-id
      expect(parts[2]).toHaveLength(16); // parent-id
      expect(parts[3]).toBe('01'); // trace-flags
    });

    it('generates unique trace-id and parent-id per call', () => {
      const a = generateTraceparent();
      const b = generateTraceparent();
      expect(a).not.toBe(b);
    });
  });

  describe('generateTracestate', () => {
    it('returns mock=true', () => {
      expect(generateTracestate()).toBe('mock=true');
    });
  });

  describe('injectTraceHeaders', () => {
    it('adds traceparent header to an existing Headers object', () => {
      const headers = new Headers();
      injectTraceHeaders(headers);

      const traceparent = headers.get('traceparent');
      expect(traceparent).not.toBeNull();
      expect(isValidTraceparent(traceparent!)).toBe(true);
    });

    it('adds tracestate header', () => {
      const headers = new Headers();
      injectTraceHeaders(headers);

      expect(headers.get('tracestate')).toBe('mock=true');
    });

    it('preserves existing headers', () => {
      const headers = new Headers({ 'content-type': 'application/json' });
      injectTraceHeaders(headers);

      expect(headers.get('content-type')).toBe('application/json');
      expect(headers.get('traceparent')).not.toBeNull();
    });

    it('returns the same headers instance for chaining', () => {
      const headers = new Headers();
      const result = injectTraceHeaders(headers);
      expect(result).toBe(headers);
    });
  });

  describe('withTraceHeaders', () => {
    it('creates a new Headers object with trace context', () => {
      const headers = withTraceHeaders();

      expect(isValidTraceparent(headers.get('traceparent')!)).toBe(true);
      expect(headers.get('tracestate')).toBe('mock=true');
    });

    it('preserves existing headers from HeadersInit', () => {
      const headers = withTraceHeaders({ 'x-custom': 'value' });

      expect(headers.get('x-custom')).toBe('value');
      expect(headers.get('traceparent')).not.toBeNull();
      expect(headers.get('tracestate')).toBe('mock=true');
    });
  });

  describe('isValidTraceparent', () => {
    it('validates a correct traceparent', () => {
      expect(
        isValidTraceparent(
          '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
        ),
      ).toBe(true);
    });

    it('rejects invalid version', () => {
      expect(
        isValidTraceparent(
          '01-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
        ),
      ).toBe(false);
    });

    it('rejects uppercase hex', () => {
      expect(
        isValidTraceparent(
          '00-4BF92F3577B34DA6A3CE929D0E0E4736-00F067AA0BA902B7-01',
        ),
      ).toBe(false);
    });

    it('rejects wrong trace-id length', () => {
      expect(
        isValidTraceparent('00-4bf92f3577b34da6a3ce929d-00f067aa0ba902b7-01'),
      ).toBe(false);
    });

    it('rejects wrong parent-id length', () => {
      expect(
        isValidTraceparent(
          '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa-01',
        ),
      ).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidTraceparent('')).toBe(false);
    });
  });
});
