export const createRateLimiter = () => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100;

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const timestamps = requests.get(key);
    const recentRequests = timestamps.filter((time) => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
        timestamp: new Date().toISOString(),
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);

    // Cleanup old entries
    if (requests.size > 1000) {
      const oldestKey = requests.keys().next().value;
      requests.delete(oldestKey);
    }

    next();
  };
};

export default createRateLimiter;
