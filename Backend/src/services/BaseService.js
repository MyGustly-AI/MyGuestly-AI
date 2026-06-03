import { AppError } from "../utils/AppError.js";

/**
 * Base Service Class
 * Provides common database and business logic methods
 * Ensures consistent error handling and validation
 */
export class BaseService {
  /**
   * Constructor - requires Prisma model
   */
  constructor(prisma, model) {
    this.prisma = prisma;
    this.model = model;
  }

  /**
   * Find by ID
   */
  async findById(id) {
    try {
      const record = await this.model.findUnique({
        where: { id },
      });

      if (!record) {
        throw AppError.notFound(`${this.model.name} not found`);
      }

      return record;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find all with pagination
   */
  async findAll(
    where = {},
    skip = 0,
    take = 10,
    orderBy = { createdAt: "desc" },
  ) {
    try {
      const [records, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take,
          orderBy,
        }),
        this.model.count({ where }),
      ]);

      return {
        data: records,
        total,
        skip,
        take,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Find one with optional where condition
   */
  async findOne(where) {
    try {
      const record = await this.model.findFirst({
        where,
      });

      return record;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new record
   */
  async create(data) {
    try {
      const record = await this.model.create({
        data,
      });

      return record;
    } catch (error) {
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0] || "field";
        throw AppError.conflict(`${field} already exists`);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Update record
   */
  async update(id, data) {
    try {
      const record = await this.model.update({
        where: { id },
        data,
      });

      return record;
    } catch (error) {
      if (error.code === "P2025") {
        throw AppError.notFound("Record not found");
      }
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0] || "field";
        throw AppError.conflict(`${field} already exists`);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Delete record
   */
  async delete(id) {
    try {
      const record = await this.model.delete({
        where: { id },
      });

      return record;
    } catch (error) {
      if (error.code === "P2025") {
        throw AppError.notFound("Record not found");
      }
      throw this.handleError(error);
    }
  }

  /**
   * Count records
   */
  async count(where = {}) {
    try {
      return await this.model.count({ where });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if record exists
   */
  async exists(where) {
    try {
      const record = await this.model.findFirst({ where });
      return !!record;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk create
   */
  async createMany(data) {
    try {
      const records = await this.model.createMany({
        data,
        skipDuplicates: true,
      });

      return records;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Error handling - Prisma specific
   */
  handleError(error) {
    if (error instanceof AppError) {
      return error;
    }

    // Prisma specific errors
    if (error.code?.startsWith("P")) {
      console.error("Prisma error:", error);
      return AppError.internalError("Database operation failed");
    }

    // Generic errors
    console.error("Service error:", error);
    return AppError.internalError(error.message || "An error occurred");
  }
}
