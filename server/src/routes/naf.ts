import { Router, Request, Response } from 'express';
import * as nafService from '../services/nafService';

export const nafRouter = Router();

nafRouter.get('/sections', async (_req: Request, res: Response) => {
  try {
    const sections = await nafService.getSections();
    res.json(sections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

nafRouter.get('/divisions', async (req: Request, res: Response) => {
  try {
    const divisions = await nafService.getDivisions(req.query.section as string);
    res.json(divisions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

nafRouter.get('/groups', async (req: Request, res: Response) => {
  try {
    const groups = await nafService.getGroups(req.query.division as string);
    res.json(groups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

nafRouter.get('/classes', async (req: Request, res: Response) => {
  try {
    const classes = await nafService.getClasses(req.query.group as string);
    res.json(classes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

nafRouter.get('/subclasses', async (req: Request, res: Response) => {
  try {
    const subclasses = await nafService.getSubclasses(req.query.class as string);
    res.json(subclasses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

nafRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      return res.json([]);
    }
    const results = await nafService.searchNaf(q);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

nafRouter.get('/tree', async (_req: Request, res: Response) => {
  try {
    const tree = await nafService.getTree();
    res.json(tree);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
