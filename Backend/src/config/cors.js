import cors from "cors";
import env from "./env.js";

const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim().replace(/\/$/, ""));

const corsOptions = {
    origin: (origin, callback) => {
        // Allow no-origin requests (Postman, mobile apps, curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS: Origin "${origin}" is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count", "X-Page"],
    maxAge: 86400,
};

export default cors(corsOptions);
