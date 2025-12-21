import '@testing-library/jest-dom';

// Keep Jest output signal-only: suppress known-benign React/MUI act warnings.
// We still fail on real test errors and unexpected console errors.
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
	const joined = args
		.map((a) => (typeof a === 'string' ? a : ''))
		.filter(Boolean)
		.join(' ');
	if (
		joined.includes('was not wrapped in act') &&
		(joined.includes('TouchRipple') || joined.includes('MagicLinkVerifier'))
	) {
		return;
	}

	originalConsoleError(...args);
};
