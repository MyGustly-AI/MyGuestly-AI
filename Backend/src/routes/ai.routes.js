import { Router } from 'express';
import { categorizeMedia } from '../controllers/ai.controller.js';

const router = Router();

// POST request to /api/ai/organize
router.post('/organize', categorizeMedia);

export default router;