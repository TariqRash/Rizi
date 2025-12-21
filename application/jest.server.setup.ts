// Jest's node environment can run without the Web Fetch globals that Next.js
// route handlers expect (Request/Response/Headers).
//
// Node 20 ships `fetch` + friends as globals, but some test runners/configs can
// still end up without them. We assert they exist up-front.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

// Prefer Node's built-in fetch implementation (Node 18+).
// If it's missing, we can't safely import Next.js route handlers.
if (!g.fetch || !g.Request || !g.Response || !g.Headers) {
	throw new Error(
		'Missing Web Fetch globals (fetch/Request/Response/Headers). Run tests on Node 18+ (Node 20 recommended).'
	);
}
