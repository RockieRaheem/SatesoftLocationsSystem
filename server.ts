import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import type { ElectoralFilters, UgandaElectoralSummary } from './electoral/types.ts';
import { countryFromRow, countryToRow, regionFromRow, regionToRow } from './src/supabase/mappers.ts';
import { createPublicServerClient, createUserScopedClient, isServerSupabaseConfigured } from './src/supabase/server.ts';
import type { Country, RegionalEconomicLevel } from './types.ts';
import { countryInputSchema, parseBody, regionalLevelInputSchema } from './src/validation/registry.ts';

const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => handler(req, res).catch(next);

const parseId = (value: string | string[]): number => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw Object.assign(new Error('Invalid resource identifier.'), { status: 400 });
  return id;
};

const filtersFrom = (query: Request['query']): ElectoralFilters => ({
  district: typeof query.district === 'string' ? query.district : undefined,
  constituency: typeof query.constituency === 'string' ? query.constituency : undefined,
  subcounty: typeof query.subcounty === 'string' ? query.subcounty : undefined,
  parish: typeof query.parish === 'string' ? query.parish : undefined,
  search: typeof query.search === 'string' ? query.search.trim().slice(0, 100) : undefined,
});

function requireBearer(req: Request): string {
  const [scheme, token] = (req.header('authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) throw Object.assign(new Error('Authentication required.'), { status: 401 });
  return token;
}

function databaseError(error: { message: string; code?: string } | null): void {
  if (!error) return;
  const status = error.code === '42501' ? 403 : error.code === '23505' ? 409 : 500;
  throw Object.assign(new Error(status === 500 ? 'The registry database operation failed.' : error.message, { cause: error }), { status });
}

async function startServer() {
  const app = express();
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');

  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean);
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : '';
  const supabaseSocket = supabaseUrl ? `wss://${new URL(supabaseUrl).host}` : '';
  const connectSources = ["'self'", supabaseOrigin, supabaseSocket].filter(Boolean).join(' ');
  app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : process.env.NODE_ENV !== 'production', credentials: false }));
  app.use(express.json({ limit: '1mb', strict: true }));
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set({
      'Content-Security-Policy': `default-src 'self'; connect-src ${connectSources}; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'`,
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });
    next();
  });

  app.get('/api/health', (_req, res) => res.status(isServerSupabaseConfigured() ? 200 : 503).json({
    status: isServerSupabaseConfigured() ? 'ok' : 'configuration-required', database: 'supabase',
  }));

  app.use('/api', async (req, res, next) => {
    try {
      if (!isServerSupabaseConfigured()) throw Object.assign(new Error('Supabase is not configured.'), { status: 503 });
      const accessToken = requireBearer(req);
      const { data, error } = await createPublicServerClient().auth.getUser(accessToken);
      if (error || !data.user) throw Object.assign(new Error('Your session is invalid or expired.'), { status: 401 });
      res.locals.accessToken = accessToken;
      res.locals.authUser = data.user;
      next();
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/profile', asyncRoute(async (_req, res) => {
    const db = createUserScopedClient(res.locals.accessToken);
    const { data, error } = await db.from('profiles').select('*').eq('id', res.locals.authUser.id).single();
    databaseError(error);
    res.json(data);
  }));

  app.get('/api/countries', asyncRoute(async (_req, res) => {
    const { data, error } = await createUserScopedClient(res.locals.accessToken).from('countries').select('*').order('name');
    databaseError(error);
    res.json((data ?? []).map(countryFromRow));
  }));

  app.get('/api/countries/:id', asyncRoute(async (req, res) => {
    const { data, error } = await createUserScopedClient(res.locals.accessToken).from('countries').select('*').eq('id', parseId(req.params.id)).maybeSingle();
    databaseError(error);
    if (!data) throw Object.assign(new Error('Country not found.'), { status: 404 });
    res.json(countryFromRow(data));
  }));

  app.post('/api/countries', asyncRoute(async (req, res) => {
    const input = parseBody(countryInputSchema, req.body) as Omit<Country, 'id'>;
    const { data, error } = await createUserScopedClient(res.locals.accessToken).from('countries').insert(countryToRow(input)).select().single();
    databaseError(error);
    res.status(201).json(countryFromRow(data!));
  }));

  app.put('/api/countries/:id', asyncRoute(async (req, res) => {
    const input = parseBody(countryInputSchema, req.body) as Country;
    const { data, error } = await createUserScopedClient(res.locals.accessToken).from('countries').update(countryToRow(input)).eq('id', parseId(req.params.id)).select().maybeSingle();
    databaseError(error);
    if (!data) throw Object.assign(new Error('Country not found.'), { status: 404 });
    res.json(countryFromRow(data));
  }));

  app.delete('/api/countries/:id', asyncRoute(async (req, res) => {
    const { error } = await createUserScopedClient(res.locals.accessToken).from('countries').delete().eq('id', parseId(req.params.id));
    databaseError(error);
    res.status(204).send();
  }));

  app.get('/api/regions', asyncRoute(async (_req, res) => {
    const { data, error } = await createUserScopedClient(res.locals.accessToken).from('regional_economic_levels').select('*').order('name');
    databaseError(error);
    res.json((data ?? []).map(regionFromRow));
  }));

  app.put('/api/regions/:id', asyncRoute(async (req, res) => {
    const region = { ...(parseBody(regionalLevelInputSchema, req.body) as RegionalEconomicLevel), id: parseId(req.params.id) };
    const { data, error } = await createUserScopedClient(res.locals.accessToken).from('regional_economic_levels').upsert(regionToRow(region)).select().single();
    databaseError(error);
    res.json(regionFromRow(data!));
  }));

  app.delete('/api/regions/:id', asyncRoute(async (req, res) => {
    const { error } = await createUserScopedClient(res.locals.accessToken).from('regional_economic_levels').delete().eq('id', parseId(req.params.id));
    databaseError(error);
    res.status(204).send();
  }));

  const activeDataset = async (accessToken: string) => {
    const result = await createUserScopedClient(accessToken).from('electoral_datasets').select('*').eq('country_code', 'UG').eq('active', true).maybeSingle();
    databaseError(result.error);
    if (!result.data) throw Object.assign(new Error('No active Uganda electoral dataset has been imported.'), { status: 404 });
    return result.data;
  };
  const cacheElectoral = (_req: Request, res: Response, next: NextFunction) => { res.set('Cache-Control', 'private, max-age=60'); next(); };

  app.get('/api/electoral/uganda/summary', cacheElectoral, asyncRoute(async (_req, res) => {
    const dataset = await activeDataset(res.locals.accessToken);
    res.json(dataset.summary as unknown as UgandaElectoralSummary);
  }));

  const levelMap = { districts: 'district', constituencies: 'constituency', subcounties: 'subcounty', parishes: 'parish' } as const;
  for (const endpoint of Object.keys(levelMap) as Array<keyof typeof levelMap>) {
    app.get(`/api/electoral/uganda/${endpoint}`, cacheElectoral, asyncRoute(async (req, res) => {
      const filters = filtersFrom(req.query);
      const { data, error } = await createUserScopedClient(res.locals.accessToken).rpc('electoral_options', {
        p_level: levelMap[endpoint], p_district: filters.district, p_constituency: filters.constituency, p_subcounty: filters.subcounty,
      });
      databaseError(error);
      res.json({ data: (data ?? []).map(item => ({ id: item.id, name: item.name, recordCount: Number(item.record_count), needsVerification: item.needs_verification })) });
    }));
  }

  app.get('/api/electoral/uganda/villages', cacheElectoral, asyncRoute(async (req, res) => {
    const filters = filtersFrom(req.query);
    const dataset = await activeDataset(res.locals.accessToken);
    const parsedPage = Number.parseInt(String(req.query.page ?? '1'), 10);
    const parsedPageSize = Number.parseInt(String(req.query.pageSize ?? '50'), 10);
    const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
    const pageSize = Number.isFinite(parsedPageSize) ? Math.min(200, Math.max(1, parsedPageSize)) : 50;
    const start = (page - 1) * pageSize;
    let query = createUserScopedClient(res.locals.accessToken).from('electoral_locations')
      .select('id,district,constituency,subcounty,parish,village,needs_verification,sources', { count: 'exact' }).eq('dataset_id', dataset.id);
    if (filters.district) query = query.eq('district', filters.district.trim().toUpperCase());
    if (filters.constituency) query = query.eq('constituency', filters.constituency.trim().toUpperCase());
    if (filters.subcounty) query = query.eq('subcounty', filters.subcounty.trim().toUpperCase());
    if (filters.parish) query = query.eq('parish', filters.parish.trim().toUpperCase());
    if (filters.search) query = query.textSearch('search_document', filters.search, { config: 'simple', type: 'plain' });
    const { data, error, count } = await query.order('id').range(start, start + pageSize - 1);
    databaseError(error);
    res.json({
      data: (data ?? []).map(row => ({ id: row.id, district: row.district, constituency: row.constituency, subcounty: row.subcounty, parish: row.parish, village: row.village, needsVerification: row.needs_verification, sources: row.sources })),
      pagination: { page, pageSize, totalItems: count ?? 0, totalPages: Math.ceil((count ?? 0) / pageSize) },
    });
  }));

  app.use('/api', (_req, _res, next) => next(Object.assign(new Error('API endpoint not found.'), { status: 404 })));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.use((error: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    if (status === 500) console.error(error);
    res.status(status).json({ message: status === 500 ? 'An unexpected server error occurred.' : error.message });
  });

  app.listen(port, '0.0.0.0', () => console.log(`Registry server running on http://localhost:${port}`));
}

startServer().catch(error => { console.error(error); process.exitCode = 1; });
