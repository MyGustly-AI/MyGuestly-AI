# Sprint 1 Implementation Guide

## ✅ Completed Files

### 1. **API Response Handler** (`src/utils/ApiResponse.js`)
- ✅ Standard success/error responses
- ✅ HTTP status code specific methods (created, badRequest, unauthorized, etc.)
- ✅ Paginated list responses
- ✅ Consistent JSON formatting

**Usage:**
```javascript
// Success
ApiResponse.success(res, "User created", userData, 201);

// Paginated list
ApiResponse.paginated(res, users, page, limit, total);

// Errors
ApiResponse.notFound(res, "User not found");
ApiResponse.badRequest(res, "Invalid email", errors);
```

---

### 2. **Custom Error Handler** (`src/utils/AppError.js`)
- ✅ Custom error class extending Error
- ✅ Static methods for common HTTP errors
- ✅ Structured error information

**Usage:**
```javascript
throw AppError.notFound("User not found");
throw AppError.badRequest("Invalid email", errors);
throw AppError.conflict("Email already exists");
```

---

### 3. **Validation Schemas** (`src/utils/validationSchemas.js`)
- ✅ Auth schemas (register, login, refresh token)
- ✅ Event schemas (create, update, list)
- ✅ Guest schemas (invite, bulk invite, RSVP)
- ✅ Media schemas (upload, voice notes)
- ✅ Memory schemas (add, update, list)
- ✅ QR verification schema
- ✅ Validation middleware helpers

**Usage:**
```javascript
import { authSchemas, validateRequest } from "../utils/validationSchemas.js";

router.post("/register", validateRequest(authSchemas.register), registerHandler);
```

---

### 4. **Base Controller** (`src/controllers/BaseController.js`)
- ✅ Extends all controllers with response methods
- ✅ Consistent error handling
- ✅ Pagination helper methods
- ✅ Async error wrapper

**Usage:**
```javascript
import { BaseController } from "./BaseController.js";

class UserController extends BaseController {
  async getUser(req, res) {
    try {
      // ... your logic
      this.success(res, "User retrieved", user);
    } catch (error) {
      this.badRequest(res, error.message);
    }
  }
}
```

---

### 5. **Base Service** (`src/services/BaseService.js`)
- ✅ Common database operations (CRUD)
- ✅ Pagination support
- ✅ Prisma error handling
- ✅ Conflict detection
- ✅ Bulk operations

**Usage:**
```javascript
import { BaseService } from "./BaseService.js";
import { prisma } from "../utils/prisma.js";

class UserService extends BaseService {
  constructor() {
    super(prisma, prisma.user);
  }
}

// In controller
const service = new UserService();
const user = await service.findById(userId);
const { data, total } = await service.findAll({}, skip, take);
```

---

### 6. **Middleware Stack** (`src/middlewares/authMiddleware.js`)
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Optional auth
- ✅ Error handler
- ✅ 404 handler
- ✅ Request logger
- ✅ CORS config
- ✅ Rate limiter

**Usage:**
```javascript
import { authMiddleware, authorize, errorHandler } from "../middlewares/authMiddleware.js";

app.post("/admin/users", authMiddleware, authorize("ADMIN"), handleCreateUser);
app.use(errorHandler);
```

---

### 7. **Helper Utilities** (`src/utils/helpers.js`)

#### **JWT Utilities**
```javascript
import { JwtUtil } from "../utils/helpers.js";

const tokens = JwtUtil.generateTokenPair(userId, role);
JwtUtil.verifyAccessToken(token);
```

#### **QR Code Utilities**
```javascript
import { QRUtil } from "../utils/helpers.js";

const qrToken = QRUtil.generateQRToken(); // UUID
const eventCode = QRUtil.generateEventCode(); // ABC-123-DEF
const totp = QRUtil.generateTOTP(qrToken); // 6-digit code
const isValid = QRUtil.verifyTOTP(qrToken, providedCode); // true/false
```

#### **Password Utilities**
```javascript
import { PasswordUtil } from "../utils/helpers.js";

const hashed = PasswordUtil.hashPassword(password);
const isValid = PasswordUtil.comparePassword(plain, hashed);
PasswordUtil.validatePasswordStrength(password); // { length, uppercase, lowercase, numbers }
```

#### **Email/Phone Utilities**
```javascript
import { EmailUtil, PhoneUtil } from "../utils/helpers.js";

EmailUtil.isValidEmail(email);
PhoneUtil.normalizeNigerianPhone(phone); // Convert to 234XXXXXXXXXX format
```

#### **Pagination Utilities**
```javascript
import { PaginationUtil } from "../utils/helpers.js";

const { page, limit } = PaginationUtil.validateParams(1, 10);
const skip = PaginationUtil.getSkip(page, limit);
const metadata = PaginationUtil.getMetadata(total, page, limit);
```

---

## 📝 Next Steps (Sprint 1 Tasks)

### Task 1: Setup Modular Folder Structure ✅
**Status:** Completed
- ✅ Controllers folder ready with BaseController
- ✅ Services folder ready with BaseService
- ✅ Middlewares folder ready
- ✅ Utils folder fully populated
- ✅ Routes folder (ready for implementation)

### Task 2: Design API Response Structure ✅
**Status:** Completed
- ✅ ApiResponse.js with all HTTP methods
- ✅ Consistent JSON format
- ✅ Pagination support
- ✅ Error handling

### Task 3: Setup Controller/Service Pattern ✅
**Status:** Completed
- ✅ BaseController with response methods
- ✅ BaseService with CRUD operations
- ✅ Async error handling

### Task 4: Setup Validation Schemas ✅
**Status:** Completed
- ✅ Joi schemas for all features
- ✅ Validation middleware

### Task 5: Design Shared DTO Patterns
**Status:** Pending - Next step
- Create DTO classes for data transformation
- Standardize request/response formats

### Task 6: Error Handling Strategy
**Status:** Completed
- ✅ AppError custom class
- ✅ Middleware error handler
- ✅ HTTP status code handling

### Task 7: Authentication/Authorization Flow
**Status:** Completed
- ✅ JWT utilities
- ✅ Auth middleware
- ✅ Role-based authorization

### Task 8: QR Code & TOTP Flow
**Status:** Completed
- ✅ QR token generation
- ✅ Event code generation
- ✅ TOTP generation & verification
- ✅ Anti-screenshot (30s rotation)

---

## 🔧 Installation & Setup

### 1. Install dependencies
```bash
npm install joi jsonwebtoken uuid bcryptjs dotenv
```

### 2. Create `.env.example`
```
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Update `app.js` with middleware
```javascript
import express from "express";
import cors from "cors";
import {
  authMiddleware,
  errorHandler,
  notFoundHandler,
  requestLogger,
  corsConfig,
  createRateLimiter,
} from "./middlewares/authMiddleware.js";

const app = express();

// Middleware
app.use(cors(corsConfig));
app.use(express.json());
app.use(requestLogger);
app.use(createRateLimiter());

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler (must be last)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

---

## 📚 Example Controller Implementation

```javascript
import { BaseController } from "./BaseController.js";
import { UserService } from "../services/UserService.js";
import { validateRequest } from "../utils/validationSchemas.js";
import { authSchemas } from "../utils/validationSchemas.js";

class UserController extends BaseController {
  constructor() {
    super();
    this.userService = new UserService();
  }

  register = this.asyncHandler(async (req, res) => {
    const user = await this.userService.create(req.body);
    this.created(res, "User registered successfully", user);
  });

  login = this.asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await this.userService.login(email, password);
    this.success(res, "Login successful", result);
  });

  getUsers = this.asyncHandler(async (req, res) => {
    const { page, limit } = this.getPaginationParams(req);
    const { data, total } = await this.userService.findAll({}, page - 1, limit);
    this.paginated(res, data, page, limit, total);
  });
}

export default new UserController();
```

---

## ✅ Checklist for Team

- [ ] Review ApiResponse and AppError usage
- [ ] Understand validation schema pattern
- [ ] Study BaseController and BaseService
- [ ] Install all dependencies
- [ ] Test middleware stack in development
- [ ] Create sample controller/service
- [ ] Test error handling
- [ ] Verify QR/TOTP generation

---

## 📞 Questions?

Refer to the inline comments in each utility file or ask the team lead!

Happy coding! 🚀
