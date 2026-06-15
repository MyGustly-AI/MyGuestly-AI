import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: "myguestly_" });

export const httpRequestDuration = new client.Histogram({
  name: "myguestly_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new client.Counter({
  name: "myguestly_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

export const activeConnections = new client.Gauge({
  name: "myguestly_active_connections",
  help: "Number of active connections",
});

export const checkinsTotal = new client.Counter({
  name: "myguestly_checkins_total",
  help: "Total number of guest check-ins",
});

export function metricsMiddleware(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || "unknown";
    httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, duration);
    httpRequestTotal.inc({ method: req.method, route, status_code: res.statusCode });
  });
  next();
}

export function metricsHandler(_req, res) {
  res.set("Content-Type", client.register.contentType);
  client.register.metrics().then((data) => res.end(data));
}
