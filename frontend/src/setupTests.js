// jest-dom adds custom jest matchers for asserting on DOM nodes,
// e.g. expect(element).toHaveTextContent(/react/i)
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// React Router v7 needs TextEncoder, which CRA's jsdom test environment doesn't provide.
Object.assign(global, { TextEncoder, TextDecoder });
