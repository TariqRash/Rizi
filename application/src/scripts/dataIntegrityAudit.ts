/*
 Data integrity audit (static). 

 Goals:
 - Enumerate Prisma models + fields from prisma/schema.prisma
 - Enumerate API route request-body fields (best-effort)
 - Emit a report to stdout and return non-zero exit code if obvious issues are found

 Notes:
 - This is intentionally lightweight and static: it doesn’t connect to a database.
 - It’s meant to catch drift like “UI/API sends foo but model has bar” and missing CRUD endpoints.
*/

import fs from 'node:fs';
import path from 'node:path';

type PrismaModel = {
  name: string;
  fields: Set<string>;
};

type ApiRoute = {
  file: string;
  bodyFields: Set<string>;
  usesZod: boolean;
  contents: string;
};

const repoRoot = path.resolve(__dirname, '..', '..'); // application/
const schemaPath = path.join(repoRoot, 'prisma', 'schema.prisma');
const apiRoot = path.join(repoRoot, 'src', 'app', 'api');

function readAllFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...readAllFiles(full));
    else out.push(full);
  }
  return out;
}

function parsePrismaModels(schema: string): PrismaModel[] {
  const models: PrismaModel[] = [];
  const modelRe = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;

  let m: RegExpExecArray | null;
  while ((m = modelRe.exec(schema))) {
    const name = m[1];
    const body = m[2];
    const fields = new Set<string>();

    for (const rawLine of body.split('\n')) {
      const line = rawLine.trim();
      // skip comments/attributes/empty
      if (!line || line.startsWith('//') || line.startsWith('@@') || line.startsWith('@')) continue;

      // field lines are like: fieldName Type? @attr
      const fieldMatch = /^([A-Za-z_]\w*)\s+/.exec(line);
      if (!fieldMatch) continue;
      const fieldName = fieldMatch[1];

      // Skip relation arrays? No, keep them—they matter for coverage, but they are not “columns”.
      // For drift checking we mainly care about scalar columns, but we can
  // detect common payload mistakes too.
      fields.add(fieldName);
    }

    models.push({ name, fields });
  }

  return models;
}

function extractBodyFieldsFromApiFile(contents: string): { fields: Set<string>; usesZod: boolean } {
  const fields = new Set<string>();

  const usesZod =
    /\bfrom\s+['\"]zod['\"]/.test(contents) ||
    /\bz\./.test(contents) ||
    /\bfrom\s+['\"]lib\/validation\//.test(contents);

  // Heuristic 1: z.object({ ... }) keys
  // This pulls keys like: z.object({ userId: z.string(), unitId: z.string() })
  const zObjectRe = /z\.object\(\s*\{([\s\S]*?)\}\s*\)/g;
  let zm: RegExpExecArray | null;
  while ((zm = zObjectRe.exec(contents))) {
    const objBody = zm[1];
    for (const line of objBody.split('\n')) {
      const keyMatch = /^\s*([A-Za-z_]\w*)\s*:/.exec(line);
      if (keyMatch) fields.add(keyMatch[1]);
    }
  }

  // Heuristic 2: destructuring await req.json(): const { a, b } = await req.json()
  const destructRe = /const\s*\{([^}]+)\}\s*=\s*await\s*req\.json\(\)/g;
  let dm: RegExpExecArray | null;
  while ((dm = destructRe.exec(contents))) {
    const inside = dm[1];
    for (const part of inside.split(',')) {
      const cleaned = part.trim().split(':')[0]?.trim();
      if (cleaned) fields.add(cleaned);
    }
  }

  // Heuristic 3: schema.safeParse(await req.json()) => way to count request bodies
  // When a route uses shared Zod schemas, keys may not be easily extractable here,
  // but we should still treat it as having a request body.
  if (/\.safeParse\(\s*await\s*req\.json\(\)/.test(contents) || /\.safeParse\(\s*await\s*req\.json\(\)\s*\.catch\(\)/.test(contents)) {
    fields.add('__body__');
  }

  return { fields, usesZod };
}

function main() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const models = parsePrismaModels(schema);

  const apiFiles = readAllFiles(apiRoot).filter((f) => /route\.(ts|tsx)$/.test(f));
  const routes: ApiRoute[] = apiFiles.map((file) => {
    const contents = fs.readFileSync(file, 'utf8');
    const { fields, usesZod } = extractBodyFieldsFromApiFile(contents);
    return { file: path.relative(repoRoot, file), bodyFields: fields, usesZod, contents };
  });

  // Build a simple “known entity names” set to help classify routes (best-effort)
  const modelNameSet = new Set(models.map((m) => m.name.toLowerCase()));

  // Report
  const lines: string[] = [];
  lines.push('# Data Integrity Audit (static)');
  lines.push('');
  lines.push(`- Prisma models: ${models.length}`);
  lines.push(`- API route handlers: ${routes.length}`);
  lines.push('');

  // Validation sync drift indicator: some routes use zod, others are manual
  const zodCount = routes.filter((r) => r.usesZod && r.bodyFields.size > 0).length;
  const bodyCount = routes.filter((r) => r.bodyFields.size > 0).length;
  lines.push('## Validation style');
  lines.push(`- Routes with request bodies: ${bodyCount}`);
  lines.push(`- Routes using zod (heuristic): ${zodCount}`);
  if (bodyCount > 0 && zodCount > 0 && zodCount < bodyCount) {
    lines.push('- Finding: Mixed validation styles detected (some zod, some manual). Risk of drift between UI and server validation.');
  }
  lines.push('');

  lines.push('## API request body fields (by route)');
  for (const r of routes.filter((x) => x.bodyFields.size > 0)) {
    lines.push(`- ${r.file}${r.usesZod ? ' (zod)' : ''}: ${Array.from(r.bodyFields).sort().join(', ')}`);
  }
  lines.push('');

  // Orphan field detection: body fields that cannot be found in ANY prisma model fields
  const allModelFields = new Set<string>();
  for (const m of models) for (const f of m.fields) allModelFields.add(f);

  const orphanBodyFields = new Map<string, string[]>();
  for (const r of routes) {
    const orphans: string[] = [];
    for (const f of r.bodyFields) {
      // internal marker used to count request bodies in routes that validate via schemas
      if (f === '__body__') continue;
      if (!allModelFields.has(f)) {
        // allow common non-model fields
        if (['token', 'password', 'plan', 'compoundId', 'address', 'name', 'email'].includes(f)) {
          // These can exist in models, but may be processed by services.
          // We still allow them to reduce noise.
          continue;
        }
        orphans.push(f);
      }
    }
    if (orphans.length) orphanBodyFields.set(r.file, orphans);
  }

  lines.push('## Potential orphan request fields');
  if (orphanBodyFields.size === 0) {
    lines.push('- None detected (heuristic)');
  } else {
    for (const [file, orphans] of orphanBodyFields.entries()) {
      lines.push(`- ${file}: ${orphans.join(', ')}`);
    }
  }
  lines.push('');

  // Multi-tenancy guard checks (heuristic)
  // We expect compound-scoped resources to either:
  // - use withCompoundAuth(...)
  // - OR explicitly read x-compound-id / active_compound_id and 400 if absent
  const compoundScopedPrefixes = [
    'src/app/api/buildings/',
    'src/app/api/units/',
    'src/app/api/residents/',
    'src/app/api/household-members/',
  ];

  const guardFindings: string[] = [];
  const compoundContextRe = /x-compound-id|active_compound_id/;
  const withCompoundAuthRe = /withCompoundAuth\s*\(/;

  for (const r of routes) {
    if (!compoundScopedPrefixes.some((p) => r.file.startsWith(p))) continue;

    const looksGuarded = withCompoundAuthRe.test(r.contents) || compoundContextRe.test(r.contents);
    if (!looksGuarded) {
      guardFindings.push(`${r.file} (missing compound context guard)`);
    }
  }

  lines.push('## Multi-tenancy guard checks (heuristic)');
  if (guardFindings.length === 0) {
    lines.push('- All checked compound-scoped routes appear to reference compound context or withCompoundAuth.');
  } else {
    lines.push('- Potential missing compound guards:');
    for (const f of guardFindings.sort()) lines.push(`  - ${f}`);
  }
  lines.push('');

  // Billing scoping check (heuristic)
  // Compound-billing schema uses Subscription.compoundId as the tenant key.
  // Flag usage patterns that look like user-billing (findByUserId(user.id))
  const billingFiles = routes.filter((r) => r.file.startsWith('src/app/api/billing/'));
  const subscriptionUserLookupRe = /subscription\.findByUserId\(\s*user\.id\s*\)/;
  const billingFindings: string[] = [];
  for (const r of billingFiles) {
    if (subscriptionUserLookupRe.test(r.contents)) billingFindings.push(`${r.file} (subscription.findByUserId(user.id))`);
  }

  lines.push('## Billing scoping checks (heuristic)');
  if (billingFindings.length === 0) {
    lines.push('- No obvious userId-based subscription lookups detected in billing routes.');
  } else {
    lines.push('- Potential compound-billing drift (userId-based subscription lookup):');
    for (const f of billingFindings.sort()) lines.push(`  - ${f}`);
  }
  lines.push('');

  // Very rough CRUD coverage for a subset: look for route folders named after models (plural)
  lines.push('## CRUD coverage (heuristic)');
  const apiDirs = fs.readdirSync(apiRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  const missing: string[] = [];

  const pluralizeApiFolder = (modelName: string) => {
    // Prefer kebab-case for multi-word models.
    // Note: this is heuristic and should be overridden for any irregular plural.
    const kebab = modelName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    if (modelName === 'ServiceRequest') return 'service-requests';
    if (kebab.endsWith('s')) return kebab;
    return `${kebab}s`;
  };
  for (const model of models) {
    const plural = pluralizeApiFolder(model.name);
    if (modelNameSet.has(model.name.toLowerCase()) && !apiDirs.includes(plural)) {
      // Skip framework/internal tables
      if (['verificationtoken'].includes(model.name.toLowerCase())) continue;
      // Skip models intentionally served via other endpoints
      if (['subscription'].includes(model.name.toLowerCase())) continue;
      missing.push(model.name);
    }
  }

  if (missing.length === 0) {
    lines.push('- All models appear to have a matching top-level API folder (pluralized).');
  } else {
    lines.push(`- Models without a matching top-level /api/<plural> folder: ${missing.sort().join(', ')}`);
    lines.push('  (This is expected for modules not built yet, but it’s a useful coverage list.)');
  }

  process.stdout.write(lines.join('\n') + '\n');

  // Exit code: fail on actionable drift indicators.
  if (orphanBodyFields.size > 0 || guardFindings.length > 0 || billingFindings.length > 0) process.exitCode = 2;
}

main();
