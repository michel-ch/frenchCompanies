import { Router, Request, Response } from 'express';
import * as geoService from '../services/geoService';

export const analysisRouter = Router();

analysisRouter.post('/gaps', async (req: Request, res: Response) => {
  try {
    const { center, radius_km, naf_codes, naf_level } = req.body;

    if (!center?.lat || !center?.lng || !radius_km || !naf_codes?.length) {
      return res.status(400).json({
        error: 'Required: center (lat, lng), radius_km, naf_codes[]'
      });
    }

    const result = await geoService.analyzeGaps({
      center,
      radius_km,
      naf_codes,
      naf_level,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

analysisRouter.post('/coverage', async (req: Request, res: Response) => {
  try {
    const { commune_code, postal_code, naf_code, radius_km } = req.body;

    if (!naf_code || !radius_km) {
      return res.status(400).json({
        error: 'Required: naf_code, radius_km, and one of: commune_code or postal_code'
      });
    }

    const result = await geoService.analyzeCoverage({
      commune_code,
      postal_code,
      naf_code,
      radius_km,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

analysisRouter.get('/density', async (req: Request, res: Response) => {
  try {
    const { naf_code, bbox, grid_size_km } = req.query;

    if (!naf_code || !bbox) {
      return res.status(400).json({ error: 'Required: naf_code, bbox' });
    }

    const result = await geoService.analyzeDensity({
      naf_code: naf_code as string,
      bbox: bbox as string,
      grid_size_km: grid_size_km ? parseFloat(grid_size_km as string) : undefined,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
