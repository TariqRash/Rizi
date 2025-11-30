import { NextRequest } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { Compound } from 'types';

export const TENANT_HEADER = 'x-tenant-id';
export const TENANT_SUBDOMAIN_HEADER = 'x-tenant-subdomain';
export const TENANT_DOMAIN_HEADER = 'x-tenant-domain';

export interface TenantContext {
  compound: Compound;
  hostname: string;
  subdomain?: string | null;
}

const normalizeHostname = (hostname: string | null): string | null => {
  if (!hostname) return null;

  return hostname.split(':')[0].trim().toLowerCase();
};

const extractSubdomainCandidates = (hostname: string): string[] => {
  const normalizedHost = normalizeHostname(hostname);
  if (!normalizedHost) return [];

  const parts = normalizedHost.split('.');

  if (parts.length === 1) {
    return [normalizedHost];
  }

  if (parts[0] === 'www') {
    parts.shift();
  }

  if (parts.length >= 2) {
    return [parts[0]];
  }

  return [];
};

export const buildTenantHeaders = (tenant: TenantContext | null, headers: Headers): Headers => {
  const updatedHeaders = new Headers(headers);

  if (!tenant) return updatedHeaders;

  updatedHeaders.set(TENANT_HEADER, tenant.compound.id);
  updatedHeaders.set(TENANT_SUBDOMAIN_HEADER, tenant.compound.subdomain);
  if (tenant.compound.customDomain) {
    updatedHeaders.set(TENANT_DOMAIN_HEADER, tenant.compound.customDomain);
  }

  return updatedHeaders;
};

export const resolveTenant = async (hostname: string): Promise<TenantContext | null> => {
  const normalizedHost = normalizeHostname(hostname);

  if (!normalizedHost) return null;

  const subdomainCandidates = extractSubdomainCandidates(normalizedHost);
  const databaseService = await createDatabaseService();

  const compound = await databaseService.compound.findByDomain(normalizedHost, subdomainCandidates);

  if (!compound) return null;

  return {
    compound,
    hostname: normalizedHost,
    subdomain: compound.subdomain,
  };
};

export const resolveTenantFromRequest = async (req: NextRequest): Promise<TenantContext | null> => {
  const hostname = req.headers.get('host') ?? req.nextUrl.hostname;

  if (!hostname) return null;

  return resolveTenant(hostname);
};
