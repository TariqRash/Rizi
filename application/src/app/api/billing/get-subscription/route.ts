import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { getSubscription } from './getSubscription';

/**
 * GET route to get a subscription data
 */
export const GET = withCompoundAuth(
	async (req, ctx, params) => {
		if (!ctx.compound?.id) {
			return new Response(JSON.stringify({ error: 'Compound context is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		void params;

		// Adapt to existing handler signature by passing the user and compound id
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return getSubscription(req as any, { ...ctx.user, compoundId: ctx.compound.id } as any);
	},
	{ requireCompound: true }
);

