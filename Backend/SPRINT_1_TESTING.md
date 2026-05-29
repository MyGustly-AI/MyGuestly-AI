# Sprint 1 Testing Guide

## 🧪 Test Environment Setup

```bash
# 1. Ensure Docker is running
docker-compose up

# 2. Install testing dependencies
npm install --save-dev jest supertest

# 3. Create test database (or use existing)
# Database already created during setup

# 4. Run tests
npm test
```

---

## ✅ Unit Tests

### 1. ApiResponse Tests
```javascript
// Test file: src/utils/__tests__/ApiResponse.test.js

describe('ApiResponse', () => {
  it('should return success response with 200', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    ApiResponse.success(res, "Test", { id: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return paginated response', () => {
    // Test pagination
  });

  it('should return various error codes', () => {
    // Test 400, 401, 403, 404, 409, 422, 500
  });
});
```

### 2. AppError Tests
```javascript
describe('AppError', () => {
  it('should create not found error', () => {
    const error = AppError.notFound('User not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
  });

  it('should create conflict error', () => {
    const error = AppError.conflict('Email already exists');
    expect(error.statusCode).toBe(409);
  });
});
```

### 3. Validation Schema Tests
```javascript
describe('Validation Schemas', () => {
  it('should validate auth register schema', () => {
    const { error, value } = authSchemas.register.validate({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepass123'
    });
    expect(error).toBeUndefined();
  });

  it('should fail invalid email', () => {
    const { error } = authSchemas.register.validate({
      name: 'John Doe',
      email: 'invalid-email',
      password: 'securepass123'
    });
    expect(error).toBeDefined();
  });
});
```

### 4. Helper Utilities Tests
```javascript
describe('JWT Utilities', () => {
  it('should generate access token', () => {
    const token = JwtUtil.generateAccessToken('user-id', 'HOST');
    expect(token).toBeDefined();
    const decoded = JwtUtil.verifyAccessToken(token);
    expect(decoded.userId).toBe('user-id');
  });
});

describe('QR Utilities', () => {
  it('should generate QR token as UUID', () => {
    const token = QRUtil.generateQRToken();
    expect(token).toMatch(/^[0-9a-f]{8}-/); // UUID format
  });

  it('should generate 6-digit TOTP', () => {
    const totp = QRUtil.generateTOTP('test-token');
    expect(totp).toMatch(/^\d{6}$/);
  });

  it('should verify TOTP with tolerance', () => {
    const token = 'test-token';
    const totp = QRUtil.generateTOTP(token);
    expect(QRUtil.verifyTOTP(token, totp)).toBe(true);
  });
});

describe('Password Utilities', () => {
  it('should hash and compare password', () => {
    const plain = 'mypassword123';
    const hashed = PasswordUtil.hashPassword(plain);
    expect(PasswordUtil.comparePassword(plain, hashed)).toBe(true);
  });

  it('should validate password strength', () => {
    const strength = PasswordUtil.validatePasswordStrength('Password123');
    expect(strength.length).toBe(true);
    expect(strength.uppercase).toBe(true);
  });
});

describe('Phone Utilities', () => {
  it('should normalize Nigerian phone numbers', () => {
    expect(PhoneUtil.normalizeNigerianPhone('0812345678')).toBe('2348012345678');
    expect(PhoneUtil.normalizeNigerianPhone('8012345678')).toBe('2348012345678');
  });
});
```

---

## 🔌 Integration Tests

### 1. BaseController Tests
```javascript
describe('BaseController', () => {
  const controller = new BaseController();
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  it('should send success response', () => {
    controller.success(res, 'Test', { id: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('should send paginated response', () => {
    controller.paginated(res, [{ id: 1 }], 1, 10, 100);
    const call = res.json.mock.calls[0][0];
    expect(call.pagination.total).toBe(100);
  });
});
```

### 2. BaseService Tests
```javascript
describe('BaseService', () => {
  let service;
  
  beforeAll(() => {
    service = new BaseService(prisma, prisma.user);
  });

  it('should find record by ID', async () => {
    // Requires mock user in DB or mock prisma
    const user = await service.findById('user-id');
    expect(user).toBeDefined();
  });

  it('should handle not found error', async () => {
    try {
      await service.findById('non-existent-id');
    } catch (error) {
      expect(error.statusCode).toBe(404);
    }
  });
});
```

### 3. Middleware Tests
```javascript
describe('Auth Middleware', () => {
  it('should authenticate valid token', () => {
    const token = JwtUtil.generateAccessToken('user-id', 'HOST');
    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    const res = {};
    const next = jest.fn();

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe('user-id');
  });

  it('should reject invalid token', () => {
    const req = {
      headers: { authorization: 'Bearer invalid-token' }
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

---

## 🌐 API Endpoint Tests

### Manual Testing with cURL

```bash
# Test API Response Format
curl -X GET http://localhost:5000/health

# Expected:
# {
#   "success": true,
#   "message": "...",
#   "data": {...},
#   "errors": null,
#   "timestamp": "2026-05-29T10:00:00Z"
# }

# Test Error Response
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'

# Expected 400:
# {
#   "success": false,
#   "message": "Validation failed",
#   "data": null,
#   "errors": [
#     { "field": "email", "message": "..." }
#   ]
# }
```

---

## 📝 Testing Checklist

### Response Format
- [ ] Success responses include timestamp
- [ ] Error responses include error array
- [ ] Pagination metadata correct
- [ ] HTTP status codes match response

### Error Handling
- [ ] 400 Bad Request for invalid input
- [ ] 401 Unauthorized for missing token
- [ ] 403 Forbidden for insufficient role
- [ ] 404 Not Found for missing resource
- [ ] 409 Conflict for duplicates
- [ ] 500 Internal Server Error for unexpected

### Validation
- [ ] Email validation works
- [ ] Phone number validation works
- [ ] Date validation works (future dates)
- [ ] Custom error messages appear

### Security
- [ ] JWT token generation works
- [ ] Token verification rejects invalid tokens
- [ ] Token expiry is enforced
- [ ] TOTP generation produces 6-digit codes
- [ ] TOTP verification works with tolerance

### Utilities
- [ ] QR code generation creates UUIDs
- [ ] Event codes format correctly (ABC-123-DEF)
- [ ] Phone numbers normalize properly
- [ ] Passwords hash and compare

---

## 🚀 Running Full Test Suite

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ApiResponse.test.js

# Run in watch mode (development)
npm test -- --watch
```

---

## 📊 Test Coverage Goals

| Component | Target | Status |
|-----------|--------|--------|
| ApiResponse | 100% | Pending |
| AppError | 100% | Pending |
| Validation Schemas | 95% | Pending |
| JWT Utilities | 100% | Pending |
| QR Utilities | 100% | Pending |
| Middleware | 90% | Pending |
| BaseController | 90% | Pending |
| BaseService | 85% | Pending |

---

## ✨ Sprint 1 Verification Checklist

### Architecture
- [ ] BaseController extends properly
- [ ] BaseService handles CRUD
- [ ] Middleware chain works
- [ ] Error handling catches all errors
- [ ] Async operations wrapped correctly

### Features
- [ ] API responses standardized
- [ ] Validation catches invalid input
- [ ] JWT tokens generate/verify
- [ ] QR tokens and TOTP working
- [ ] Phone number normalization
- [ ] Pagination calculations correct

### Security
- [ ] Unauthorized requests blocked
- [ ] Role-based access working
- [ ] Error messages don't leak info
- [ ] Sensitive data not logged
- [ ] CORS configured

### Database
- [ ] Prisma client initialized
- [ ] Migrations applied
- [ ] Connection working
- [ ] Error handling for DB errors

### Documentation
- [ ] Code comments clear
- [ ] README updated
- [ ] Workflow diagrams complete
- [ ] API response examples provided

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found"
```bash
# Solution: Install dependencies
npm install
```

### Issue: "Cannot connect to database"
```bash
# Solution: Verify Docker containers running
docker-compose ps
docker-compose up --build
```

### Issue: "TOTP verification fails"
```javascript
// Verify clock is synced
// Check tolerance window (±1 step)
// Ensure 30-second intervals
```

---

## 📞 Next Steps

After all tests pass:
1. Review code with team
2. Move to Sprint 2: User Authentication
3. Create sample User Controller
4. Implement login/register endpoints

Good luck! 🎉
