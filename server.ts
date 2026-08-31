import express from "express";
import cors from "cors";
import path from "path";
import { allAfricanCountries } from "./data.ts";
import type { Country } from "./types.ts";
import { getUgandaElectoralRegistry } from "./electoral/ugandaElectoralRegistry.ts";

async function startServer() {
  const app = express();
  const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);

  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean);
  app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : process.env.NODE_ENV !== 'production' }));
  app.use(express.json({ limit: '1mb' }));
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    next();
  });

  const electoralRegistry = getUgandaElectoralRegistry();

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', electoralDataset: electoralRegistry.getSummary().dataset.status }));

  // In-memory store for countries (initialized with mock data)
  let countries: Country[] = [...allAfricanCountries];

  // API Routes
  app.get("/api/countries", (req, res) => {
    res.json(countries);
  });

  app.get("/api/countries/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const country = countries.find((c) => c.id === id);
    if (country) {
      res.json(country);
    } else {
      res.status(404).json({ message: "Country not found" });
    }
  });

  app.post("/api/countries", (req, res) => {
    const newCountry: Country = {
      ...req.body,
      id: countries.length > 0 ? Math.max(...countries.map(c => c.id)) + 1 : 1,
      updatedAt: new Date().toISOString()
    };
    countries.push(newCountry);
    res.status(201).json(newCountry);
  });

  app.put("/api/countries/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = countries.findIndex((c) => c.id === id);
    if (index !== -1) {
      countries[index] = { ...req.body, id, updatedAt: new Date().toISOString() };
      res.json(countries[index]);
    } else {
      res.status(404).json({ message: "Country not found" });
    }
  });

  app.delete("/api/countries/:id", (req, res) => {
    const id = parseInt(req.params.id);
    countries = countries.filter((c) => c.id !== id);
    res.status(204).send();
  });

  const electoralFilters = (query: express.Request['query']) => ({
    district: typeof query.district === 'string' ? query.district : undefined,
    constituency: typeof query.constituency === 'string' ? query.constituency : undefined,
    subcounty: typeof query.subcounty === 'string' ? query.subcounty : undefined,
    parish: typeof query.parish === 'string' ? query.parish : undefined,
    search: typeof query.search === 'string' ? query.search.slice(0, 100) : undefined,
  });
  const cacheElectoral = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    next();
  };

  app.get('/api/electoral/uganda/summary', cacheElectoral, (_req, res) => res.json(electoralRegistry.getSummary()));
  const levelMap = { districts: 'district', constituencies: 'constituency', subcounties: 'subcounty', parishes: 'parish' } as const;
  for (const endpoint of Object.keys(levelMap) as Array<keyof typeof levelMap>) {
    app.get(`/api/electoral/uganda/${endpoint}`, cacheElectoral, (req, res) => {
      res.json({ data: electoralRegistry.getOptions(levelMap[endpoint], electoralFilters(req.query)) });
    });
  }
  app.get('/api/electoral/uganda/villages', cacheElectoral, (req, res) => {
    const parsedPage = Number.parseInt(String(req.query.page ?? '1'), 10);
    const parsedPageSize = Number.parseInt(String(req.query.pageSize ?? '50'), 10);
    const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
    const pageSize = Number.isFinite(parsedPageSize) ? Math.min(200, Math.max(1, parsedPageSize)) : 50;
    res.json(electoralRegistry.getVillages(electoralFilters(req.query), page, pageSize));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
