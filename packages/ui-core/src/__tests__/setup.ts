import { cleanup } from '@testing-library/react';
import { expect, afterEach } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});
