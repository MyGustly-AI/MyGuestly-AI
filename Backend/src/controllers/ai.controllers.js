import { organizeEventMoments } from '../services/ai.service.js';

export const categorizeMedia = async (req, res) => {
  try {
    const { mediaItems } = req.body;

    if (!mediaItems || !Array.isArray(mediaItems)) {
      return res.status(400).json({ error: 'Please provide an array of mediaItems.' });
    }

    const categorizedMoments = await organizeEventMoments(mediaItems);
    
    return res.status(200).json({
      success: true,
      message: 'Media organized successfully',
      data: categorizedMoments
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};