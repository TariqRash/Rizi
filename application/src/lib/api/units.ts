export type Unit = {
  id: string;
  number: string;
  type: string;
  status: string;
  buildingId: string;
  compoundId: string;
  createdAt: string;
  updatedAt: string;
};

export class UnitsClient {
  async list(params?: { buildingId?: string }): Promise<{ units: Unit[] }> {
    const qs = new URLSearchParams();
    if (params?.buildingId) qs.set('buildingId', params.buildingId);

    const res = await fetch(`/api/units${qs.toString() ? `?${qs.toString()}` : ''}`, { method: 'GET' });
    if (!res.ok) throw new Error('Failed to fetch units');
    return res.json();
  }

  async create(data: {
    buildingId: string;
    number: string;
    type: string;
    status?: string;
  }): Promise<{ unit: Unit }> {
    const res = await fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create unit');
    return res.json();
  }

  async update(
    id: string,
    data: { number?: string; type?: string; status?: string }
  ): Promise<{ unit: Unit }> {
    const res = await fetch(`/api/units/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update unit');
    return res.json();
  }

  async delete(id: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/units/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete unit');
    return res.json();
  }
}
