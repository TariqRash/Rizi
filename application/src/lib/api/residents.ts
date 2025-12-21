export type Resident = {
  id: string;
  userId: string;
  unitId: string;
  compoundId: string;
  isPrimary: boolean;
  moveInDate: string | null;
  moveOutDate: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  unit?: { id: string; number: string; buildingId: string };
};

export type HouseholdMember = {
  id: string;
  residentId: string;
  name: string;
  relation: string;
  phone: string | null;
  createdAt: string;
};

type ListResidentsResponse = { residents: Resident[] };

type AssignResidentResponse = { resident: Resident };

type GetResidentResponse = { resident: Resident };

type UpdateResidentResponse = { resident: Resident };

type ListHouseholdResponse = { household: HouseholdMember[] };

type CreateHouseholdResponse = { member: HouseholdMember };

export class ResidentsClient {
  async list(params?: { unitId?: string; buildingId?: string; q?: string }): Promise<ListResidentsResponse> {
    const sp = new URLSearchParams();
    if (params?.unitId) sp.set('unitId', params.unitId);
    if (params?.buildingId) sp.set('buildingId', params.buildingId);
    if (params?.q) sp.set('q', params.q);

    const path = `/api/residents${sp.toString() ? `?${sp.toString()}` : ''}`;
    const res = await fetch(path);
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load residents');
    return res.json();
  }

  async assign(input: { userId: string; unitId: string; isPrimary?: boolean; moveInDate?: string }): Promise<AssignResidentResponse> {
    const res = await fetch('/api/residents', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to assign resident');
    return res.json();
  }

  async get(id: string): Promise<GetResidentResponse> {
    const res = await fetch(`/api/residents/${id}`);
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load resident');
    return res.json();
  }

  async update(
    id: string,
    input: { isPrimary?: boolean; moveInDate?: string | null; moveOutDate?: string | null; unitId?: string }
  ): Promise<UpdateResidentResponse> {
    const res = await fetch(`/api/residents/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to update resident');
    return res.json();
  }

  async remove(id: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/residents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to delete resident');
    return res.json();
  }

  async listHousehold(residentId: string): Promise<ListHouseholdResponse> {
    const res = await fetch(`/api/residents/${residentId}/household`);
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load household');
    return res.json();
  }

  async addHouseholdMember(residentId: string, input: { name: string; relation: string; phone?: string }): Promise<CreateHouseholdResponse> {
    const res = await fetch(`/api/residents/${residentId}/household`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to add household member');
    return res.json();
  }

  async deleteHouseholdMember(id: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/household-members/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to delete household member');
    return res.json();
  }
}
