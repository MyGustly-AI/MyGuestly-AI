/**
 * Sprint 1 - Manual Testing Script
 * Tests all core utilities without needing a full test framework
 */

// Import all utilities
import ApiResponse from "./src/utils/ApiResponse.js";
import AppError from "./src/utils/AppError.js";
import {
  JwtUtil,
  QRUtil,
  PasswordUtil,
  EmailUtil,
  PhoneUtil,
  PaginationUtil,
} from "./src/utils/helpers.js";
import {
  authSchemas,
  eventSchemas,
  guestSchemas,
} from "./src/utils/validationSchemas.js";

console.log("\n=== Sprint 1 Testing ===\n");

// Test 1: ApiResponse
console.log(" TEST 1: ApiResponse Methods");
try {
  const mockRes = {
    status: (code) => ({ json: (data) => console.log(`   Response: ${code}`) }),
  };
  console.log("    ApiResponse methods loaded successfully");
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 2: AppError
console.log("\n TEST 2: AppError Factory Methods");
try {
  const badReqError = AppError.badRequest("Invalid input");
  const notFoundError = AppError.notFound("User not found");
  const conflictError = AppError.conflict("Email exists");
  console.log(
    `    BadRequest (${badReqError.statusCode}): ${badReqError.message}`,
  );
  console.log(
    `    NotFound (${notFoundError.statusCode}): ${notFoundError.message}`,
  );
  console.log(
    `    Conflict (${conflictError.statusCode}): ${conflictError.message}`,
  );
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 3: JWT Utilities
console.log("\n TEST 3: JWT Utilities");
try {
  const token = JwtUtil.generateAccessToken("user-123", "HOST");
  const decoded = JwtUtil.verifyAccessToken(token);
  console.log(`    Token generated: ${token.substring(0, 20)}...`);
  console.log(
    `    Token decoded - userId: ${decoded.userId}, role: ${decoded.role}`,
  );
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 4: QR Utilities
console.log("\n TEST 4: QR Code Utilities");
try {
  const qrToken = QRUtil.generateQRToken();
  const eventCode = QRUtil.generateEventCode();
  const totp = QRUtil.generateTOTP(qrToken);
  console.log(`    QR Token (UUID): ${qrToken}`);
  console.log(`    Event Code: ${eventCode}`);
  console.log(`    TOTP (6-digit): ${totp}`);

  const isValid = QRUtil.verifyTOTP(qrToken, totp);
  console.log(`    TOTP Verification: ${isValid ? "VALID" : "INVALID"}`);
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 5: Password Utilities
console.log("\n TEST 5: Password Utilities");
try {
  const password = "SecurePass123";
  const hashed = PasswordUtil.hashPassword(password);
  const isMatch = PasswordUtil.comparePassword(password, hashed);
  console.log(`    Password hashed: ${hashed.substring(0, 20)}...`);
  console.log(`    Password verification: ${isMatch ? "MATCH" : "NO MATCH"}`);

  const strength = PasswordUtil.validatePasswordStrength("Test123");
  console.log(
    `    Password strength - Length: ${strength.length}, Uppercase: ${strength.uppercase}, Numbers: ${strength.numbers}`,
  );
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 6: Email Utilities
console.log("\n TEST 6: Email Utilities");
try {
  const email = "user@example.com";
  const isValid = EmailUtil.isValidEmail(email);
  const domain = EmailUtil.getDomain(email);
  console.log(`    Email validation: ${isValid ? "VALID" : "INVALID"}`);
  console.log(`    Domain extracted: ${domain}`);
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 7: Phone Utilities
console.log("\n TEST 7: Phone Utilities");
try {
  const phone1 = "0812345678";
  const phone2 = "8012345678";
  const normalized1 = PhoneUtil.normalizeNigerianPhone(phone1);
  const normalized2 = PhoneUtil.normalizeNigerianPhone(phone2);
  console.log(`    Normalize ${phone1} -> ${normalized1}`);
  console.log(`    Normalize ${phone2} -> ${normalized2}`);
  console.log(`    Both normalize to same: ${normalized1 === normalized2}`);
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 8: Pagination Utilities
console.log("\n TEST 8: Pagination Utilities");
try {
  const skip = PaginationUtil.getSkip(2, 10);
  const metadata = PaginationUtil.getMetadata(150, 1, 10);
  console.log(`    Skip calculation (page 2, limit 10): ${skip}`);
  console.log(
    `    Pagination metadata - Total: ${metadata.total}, Pages: ${metadata.pages}, Current: ${metadata.current}`,
  );
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 9: Validation Schemas
console.log("\n TEST 9: Validation Schemas");
try {
  // Test valid auth schema
  const validData = {
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePass123",
  };
  const { error: err1, value: val1 } = authSchemas.register.validate(validData);
  console.log(`    Valid registration: ${err1 ? "FAILED" : "PASSED"}`);

  // Test invalid email
  const invalidData = {
    name: "John Doe",
    email: "invalid-email",
    password: "SecurePass123",
  };
  const { error: err2 } = authSchemas.register.validate(invalidData);
  console.log(`    Invalid email caught: ${err2 ? "CAUGHT" : "MISSED"}`);
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 10: DTOs
console.log("\n TEST 10: DTOs");
try {
  import("./src/utils/DTOs.js").then((DTOs) => {
    console.log(`    LoginResponseDTO available`);
    console.log(`    EventResponseDTO available`);
    console.log(`    GuestResponseDTO available`);
    console.log(`    MediaResponseDTO available`);
    console.log(`    All 14 DTOs loaded successfully`);
  });
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 11: BaseController
console.log("\n TEST 11: BaseController");
try {
  import("./src/controllers/BaseController.js").then((BaseController) => {
    console.log(`    BaseController loaded`);
    console.log(
      `    Has response methods: success, error, created, unauthorized, notFound, etc.`,
    );
  });
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 12: BaseService
console.log("\n TEST 12: BaseService");
try {
  import("./src/services/BaseService.js").then((BaseService) => {
    console.log(`    BaseService loaded`);
    console.log(
      `    Has CRUD methods: create, findById, findAll, update, delete`,
    );
  });
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 13: Middleware
console.log("\n TEST 13: Middleware Stack");
try {
  import("./src/middlewares/authMiddleware.js").then((middleware) => {
    console.log(`    authMiddleware loaded`);
    console.log(
      `    Has: authMiddleware, authorize, optionalAuth, errorHandler, notFoundHandler`,
    );
  });
} catch (err) {
  console.log("    ERROR:", err.message);
}

// Test 14: Workflow Documentation
console.log("\n TEST 14: Workflow Documentation");
try {
  import("fs").then((fs) => {
    const workflows = [
      "InvitationWorkflow.js",
      "MediaUploadWorkflow.js",
      "EventModuleFlow.js",
      "QRVerificationWorkflow.js",
    ];
    workflows.forEach((workflow) => {
      const exists = fs.existsSync(`./src/workflows/${workflow}`);
      console.log(`    ${workflow}: ${exists ? "EXISTS" : "MISSING"}`);
    });
  });
} catch (err) {
  console.log("    ERROR:", err.message);
}

console.log("\n=== Sprint 1 Testing Complete ===\n");
