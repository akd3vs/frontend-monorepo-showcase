import * as matchers from 'vitest-axe/matchers';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});
