export type Building = {
  id: string;
  name: string;
  compoundId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { units: number };
};

export class BuildingsClient {
  async list(): Promise<{ buildings: Building[] }> {
    const res = await fetch('/api/buildings', { method: 'GET' });
    if (!res.ok) throw new Error('Failed to fetch buildings');
    return res.json();
  }

  async create(data: { name: string }): Promise<{ building: Building }> {
    const res = await fetch('/api/buildings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create building');
    return res.json();
  }

  async update(id: string, data: { name?: string }): Promise<{ building: Building }> {
    const res = await fetch(`/api/buildings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update building');
    return res.json();
  }

  async delete(id: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/buildings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete building');
    return res.json();
  }
}
