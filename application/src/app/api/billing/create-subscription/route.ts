import { withCompoundAuth } from 'lib/auth/withCompoundAuth';
import { createSubscription } from './createSubscription';

export const POST = withCompoundAuth(
  async (req, ctx) => {
    if (!ctx.compound?.id) {
      return new Response(JSON.stringify({ error: 'Compound context is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return createSubscription(req, ctx.user, ctx.compound.id);
  },
  { requireCompound: true }
);
