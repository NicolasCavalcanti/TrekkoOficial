import { Router } from "express";
import { getTrailById } from "../db";

const router = Router();

// In-memory cache for GPX files (simple implementation)
const gpxCache = new Map<number, { data: Buffer; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Whitelist of allowed domains for GPX downloads
const ALLOWED_DOMAINS = ["wikiloc.com", "www.wikiloc.com", "es.wikiloc.com", "pt.wikiloc.com"];

/**
 * Validates that a URL is from an allowed domain
 */
function isValidWikilocUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_DOMAINS.some(domain => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * Sanitizes the trail name for use in filename
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}

/**
 * GET /api/trilhas/:id/mapa-offline
 * Downloads the offline map (GPX file) for a trail
 */
router.get("/:id/mapa-offline", async (req, res) => {
  try {
    const trailId = parseInt(req.params.id, 10);
    
    if (isNaN(trailId) || trailId <= 0) {
      return res.status(400).json({ error: "ID de trilha inválido" });
    }

    // Get trail from database
    const trail = await getTrailById(trailId);
    
    if (!trail) {
      return res.status(404).json({ error: "Trilha não encontrada" });
    }

    // Check if trail has GPX URL
    const gpxUrl = (trail as any).wiklocGpxUrl;
    if (!gpxUrl) {
      return res.status(404).json({ error: "Mapa offline indisponível para esta trilha" });
    }

    // Validate the GPX URL domain (security: prevent SSRF)
    if (!isValidWikilocUrl(gpxUrl)) {
      console.error(`[offline-map] Invalid GPX URL domain: ${gpxUrl}`);
      return res.status(400).json({ error: "URL de mapa inválida" });
    }

    // Check cache first
    const cached = gpxCache.get(trailId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const filename = `trekko-mapa-offline-${slugify(trail.name)}.gpx`;
      res.setHeader("Content-Type", "application/gpx+xml");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(cached.data);
    }

    // Fetch GPX file from Wikiloc with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(gpxUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Trekko/1.0 (https://trekko.com.br)",
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        console.error(`[offline-map] Failed to fetch GPX: ${response.status} ${response.statusText}`);
        return res.status(502).json({ error: "Não foi possível baixar o mapa" });
      }

      const gpxData = Buffer.from(await response.arrayBuffer());

      // Cache the GPX file
      gpxCache.set(trailId, { data: gpxData, timestamp: Date.now() });

      // Log download for analytics
      console.log(`[offline-map] Download: trail=${trailId}, name="${trail.name}"`);

      // Send the file
      const filename = `trekko-mapa-offline-${slugify(trail.name)}.gpx`;
      res.setHeader("Content-Type", "application/gpx+xml");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(gpxData);
    } catch (fetchError: any) {
      clearTimeout(timeout);
      if (fetchError.name === "AbortError") {
        console.error(`[offline-map] Timeout fetching GPX for trail ${trailId}`);
        return res.status(504).json({ error: "Tempo limite excedido ao baixar o mapa" });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[offline-map] Error:", error);
    return res.status(500).json({ error: "Erro interno ao processar o download" });
  }
});

export const offlineMapRouter = router;
