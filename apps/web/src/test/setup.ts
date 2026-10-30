import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library only cleans up on its own when Vitest globals are on; they aren't here.
afterEach(cleanup)
// The cart lives in localStorage, so each test starts with an empty one.
afterEach(() => localStorage.clear())
