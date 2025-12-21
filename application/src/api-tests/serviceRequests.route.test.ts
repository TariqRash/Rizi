/* eslint-disable @typescript-eslint/no-explicit-any */

import { GET, POST } from '../app/api/service-requests/route';
import { makeTestReq } from './testRequest';

jest.mock('lib/auth/auth', () => ({
	auth: jest.fn(),
}));

jest.mock('../services/database/databaseFactory', () => ({
	createDatabaseService: jest.fn(),
}));

const { auth } = jest.requireMock('lib/auth/auth') as { auth: jest.Mock };
const { createDatabaseService } = jest.requireMock('../services/database/databaseFactory') as {
	createDatabaseService: jest.Mock;
};

describe('API /service-requests', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('GET returns 401 when unauthenticated', async () => {
		auth.mockResolvedValue(null);

		const res = await GET(makeTestReq('http://localhost/api/service-requests') as any, {
			params: Promise.resolve({}),
		} as any);

		expect(res.status).toBe(401);
	});

	it('POST requires allowed compound role', async () => {
		auth.mockResolvedValue({ user: { id: 'u1', role: 'USER', email: 'u@u.com' } });

		createDatabaseService.mockResolvedValue({
			compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
			compoundRoleAssignment: {
				findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'RESIDENT' }),
			},
		});

		const res = await POST(
			makeTestReq('http://localhost/api/service-requests', {
				method: 'POST',
				body: JSON.stringify({ title: 'Leaking faucet', description: 'Kitchen sink faucet is leaking.' }),
				headers: { 'content-type': 'application/json' },
				cookies: { active_compound_id: 'c1' },
			}) as any,
			{ params: Promise.resolve({}) } as any
		);

		expect(res.status).toBe(403);
	});

	it('POST creates in compound and GET lists', async () => {
		auth.mockResolvedValue({ user: { id: 'u1', role: 'USER', email: 'u@u.com' } });

		const listByCompound = jest.fn().mockResolvedValue([
			{
				id: 'sr1',
				compoundId: 'c1',
				title: 'Leaking faucet',
				description: 'Kitchen sink faucet is leaking.',
				priority: 'HIGH',
				status: 'OPEN',
				createdById: 'u1',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		const create = jest.fn().mockResolvedValue({
			id: 'sr1',
			compoundId: 'c1',
			title: 'Leaking faucet',
			description: 'Kitchen sink faucet is leaking.',
			priority: 'HIGH',
			status: 'OPEN',
			createdById: 'u1',
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		createDatabaseService.mockResolvedValue({
			compound: { findById: jest.fn().mockResolvedValue({ id: 'c1' }) },
			compoundRoleAssignment: {
				findForUser: jest.fn().mockResolvedValue({ compoundId: 'c1', userId: 'u1', role: 'STAFF' }),
			},
			serviceRequest: {
				listByCompound,
				create,
			},
		});

		const createRes = await POST(
			makeTestReq('http://localhost/api/service-requests', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Leaking faucet',
					description: 'Kitchen sink faucet is leaking.',
					priority: 'HIGH',
				}),
				headers: { 'content-type': 'application/json' },
				cookies: { active_compound_id: 'c1' },
			}) as any,
			{ params: Promise.resolve({}) } as any
		);

		expect(createRes.status).toBe(201);
		const createJson = await createRes.json();
		expect(createJson.serviceRequest.id).toBe('sr1');

		const listRes = await GET(
			makeTestReq('http://localhost/api/service-requests', { cookies: { active_compound_id: 'c1' } }) as any,
			{ params: Promise.resolve({}) } as any
		);

		expect(listRes.status).toBe(200);
		const listJson = await listRes.json();
		expect(listJson.serviceRequests).toHaveLength(1);
		expect(listJson.serviceRequests[0].compoundId).toBe('c1');
	});
});
