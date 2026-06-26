// Middleware for validating request bodies using Zod schemas
export const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            console.error(`Validation failed for ${req.method} ${req.originalUrl}:`, {
                body: req.body,
                errors: result.error.flatten().fieldErrors
            });
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.flatten(),
            });
        }

        req.body = result.data;

        next();
    };
};