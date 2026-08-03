import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from './route';
import { createSessionToken, COOKIE_NAME } from '@/lib/admin-auth';

// Mock the query layer entirely -- no database is opened in this test.
vi.mock('@/lib/queries/clients', () => ({
  getClientById: vi.fn(() => ({ id: 1, status: 'intake_submitted' })),
  updateClient: vi.fn(),
}));

function stageRequest(cookie?: string): NextRequest {
  return new NextRequest('http://localhost/api/clients/1/stage', {
    method: 'PUT',
    body: JSON.stringify({ stage: 'active_client' }),
    headers: cookie ? { cookie } : {},
  });
}

const routeParams = { params: Promise.resolve({ id: '1' }) };

describe('PUT /api/clients/[id]/stage authentication', () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = 'test-secret-for-stage-route';
  });

  it('rejects unauthenticated requests with 401', async () => {
    const response = await PUT(stageRequest(), routeParams);
    expect(response.status).toBe(401);
  });

  it('allows requests with a valid admin session cookie', async () => {
    const token = createSessionToken();
    const response = await PUT(
      stageRequest(`${COOKIE_NAME}=${token}`),
      routeParams
    );
    expect(response.status).toBe(200);
  });
});
