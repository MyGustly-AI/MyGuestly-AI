import { ApiResponse } from "../shared/utils/ApiResponse.js";

export const notFoundHandler = (req, res) => {
  return ApiResponse.notFound(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
  );
};

export default notFoundHandler;
