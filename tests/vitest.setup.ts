/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, afterEach, } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

beforeAll(() => {
  expect.extend(matchers)
})

afterEach(() => {
  cleanup();
});

