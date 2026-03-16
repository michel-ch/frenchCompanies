import { Router, Request, Response } from 'express';
import * as estService from '../services/establishmentService';

export const establishmentsRouter = Router();

establishmentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const filters: estService.EstablishmentFilters = {
      naf_code: req.query.naf_code as string,
      naf_codes: req.query.naf_codes ? (req.query.naf_codes as string).split(',') : undefined,
      postal_code: req.query.postal_code as string,
      commune_code: req.query.commune_code as string,
      city: req.query.city as string,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true,
      is_employer: req.query.is_employer !== undefined ? req.query.is_employer === 'true' : undefined,
      is_headquarter: req.query.is_headquarter !== undefined ? req.query.is_headquarter === 'true' : undefined,
      workforce_bracket: req.query.workforce_bracket as string || undefined,
      creation_date_from: req.query.creation_date_from as string || undefined,
      creation_date_to: req.query.creation_date_to as string || undefined,
      bbox: req.query.bbox as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 500,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    };

    const geojson = await estService.getEstablishmentsGeoJSON(filters);
    res.json(geojson);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

establishmentsRouter.get('/count', async (req: Request, res: Response) => {
  try {
    const filters: estService.EstablishmentFilters = {
      naf_code: req.query.naf_code as string,
      naf_codes: req.query.naf_codes ? (req.query.naf_codes as string).split(',') : undefined,
      postal_code: req.query.postal_code as string,
      commune_code: req.query.commune_code as string,
      city: req.query.city as string,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true,
      is_employer: req.query.is_employer !== undefined ? req.query.is_employer === 'true' : undefined,
      is_headquarter: req.query.is_headquarter !== undefined ? req.query.is_headquarter === 'true' : undefined,
      workforce_bracket: req.query.workforce_bracket as string || undefined,
      creation_date_from: req.query.creation_date_from as string || undefined,
      creation_date_to: req.query.creation_date_to as string || undefined,
      bbox: req.query.bbox as string,
    };

    const count = await estService.getEstablishmentCount(filters);
    res.json({ count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

establishmentsRouter.get('/cluster', async (req: Request, res: Response) => {
  try {
    const filters = {
      naf_code: req.query.naf_code as string,
      bbox: req.query.bbox as string,
      zoom: req.query.zoom ? parseInt(req.query.zoom as string, 10) : 10,
      is_active: true as const,
    };

    const geojson = await estService.getClusteredEstablishments(filters);
    res.json(geojson);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

establishmentsRouter.get('/:siret', async (req: Request, res: Response) => {
  try {
    const establishment = await estService.getEstablishmentBySiret(req.params.siret);
    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }
    res.json(establishment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
