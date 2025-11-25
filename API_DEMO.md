# Multi-Tenant Backend API Documentation

API documentation với các ví dụ cURL commands để test các endpoints.

## Base URL

```
http://localhost:5000
```

## Authentication & JWT Flow

- Middleware `databaseResolver` yêu cầu mọi request (trừ `/api/login`) phải có header `jwt`.
- Header này chứa access token lấy được từ bước login.
- Nếu thiếu header, server trả lỗi `JsonWebTokenError: jwt must be provided`.
- Demo luồng:
  1. Tạo tenant mới → nhận `tenantId` & `userId`.
  2. Gọi `/api/login` với `_id` (userId) và `tenantId` → nhận `accessToken`.
  3. Gắn header `jwt: <accessToken>` cho mọi request tiếp theo (ví dụ health check, endpoints nội bộ).

## Endpoints

### 1. Tạo Tenant Mới

Tạo một tenant mới với database riêng và user đầu tiên.

**Endpoint:** `POST /api/add`

**Request Body:**
```json
{
  "name": "tenant-name",
  "dbUri": "mongodb://admin:admin123@mongodb:27017/tenant_db_name?authSource=admin",
  "email": "admin@tenant.com"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "acme-corp",
    "dbUri": "mongodb://admin:admin123@mongodb:27017/acme_corp_db?authSource=admin",
    "email": "admin@acme-corp.com"
  }'
```

**Response Success (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Tenant added successfully",
  "responseObject": {
    "tenantId": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea"
  }
}
```

**Response Error (500):**
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Error message details"
}
```

---

### 2. Login

Đăng nhập và nhận JWT token.

**Endpoint:** `POST /api/login`

**Request Body:**
```json
{
  "_id": "507f191e810c19729de860ea",
  "tenantId": "507f1f77bcf86cd799439011"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "507f191e810c19729de860ea",
    "tenantId": "507f1f77bcf86cd799439011"
  }'
```

**Response Success (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged In Successfully",
  "responseObject": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "507f191e810c19729de860ea",
    "tenantId": "507f1f77bcf86cd799439011"
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "No user with the given credentials",
  "responseObject": {
    "incorrectField": "email"
  }
}
```

---

## Ví dụ Workflow Hoàn Chỉnh

### Bước 1: Tạo Tenant Mới

```bash
curl -X POST http://localhost:5000/api/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "demo-tenant",
    "dbUri": "mongodb://admin:admin123@mongodb:27017/demo_tenant_db?authSource=admin",
    "email": "admin@demo-tenant.com"
  }'
```

**Lưu lại response:**
- `tenantId`: Sẽ dùng cho các request sau
- `userId`: Sẽ dùng cho login

### Bước 2: Login với Tenant ID và User ID

```bash
# Thay thế tenantId và userId bằng giá trị từ response bước 1
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "YOUR_USER_ID_FROM_STEP_1",
    "tenantId": "YOUR_TENANT_ID_FROM_STEP_1"
  }'
```

**Lưu lại `accessToken` từ response**

### Bước 3: Sử dụng JWT Token cho các Request Khác

```bash
# Ví dụ: Request với JWT token (nếu có endpoint khác yêu cầu authentication)
curl -X GET http://localhost:5000/api/some-endpoint \
  -H "jwt: YOUR_ACCESS_TOKEN_FROM_STEP_2"
```

---

## Testing với Script

### Tạo file `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "=== Testing Multi-Tenant API ==="
echo ""

# Test 1: Create Tenant
echo "1. Creating new tenant..."
TENANT_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-tenant-'$(date +%s)'",
    "dbUri": "mongodb://admin:admin123@mongodb:27017/test_tenant_db?authSource=admin",
    "email": "admin@test-tenant.com"
  }')

echo "Response: $TENANT_RESPONSE"
echo ""

# Extract tenantId and userId (requires jq)
TENANT_ID=$(echo $TENANT_RESPONSE | jq -r '.responseObject.tenantId')
USER_ID=$(echo $TENANT_RESPONSE | jq -r '.responseObject.userId')

echo "Tenant ID: $TENANT_ID"
echo "User ID: $USER_ID"
echo ""

# Test 2: Login
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/login \
  -H "Content-Type: application/json" \
  -d "{
    \"_id\": \"$USER_ID\",
    \"tenantId\": \"$TENANT_ID\"
  }")

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.responseObject.accessToken')
echo "Access Token: $ACCESS_TOKEN"
echo ""

echo "=== Testing Complete ==="
```

**Chạy script:**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Lưu ý

1. **Database URI Format:**
   - Format: `mongodb://username:password@host:port/database?authSource=admin`
   - Đảm bảo database đã được tạo trước hoặc MongoDB sẽ tự tạo khi có request đầu tiên

2. **JWT Token:**
   - Token được tạo với payload chứa `userId` và `tenantId`
   - Token được lưu trong header `jwt` (không phải `Authorization: Bearer`)
   - Token không có expiration time mặc định (nên thêm trong production)

3. **Multi-Tenant Isolation:**
   - Mỗi tenant có database riêng
   - Middleware `databaseResolver` tự động chọn database dựa trên `tenantId` trong JWT token

4. **Error Handling:**
   - Tất cả endpoints đều có try-catch và trả về error response chuẩn
   - Status codes: 200 (success), 201 (created), 401 (unauthorized), 500 (server error)

---

## Troubleshooting

### Lỗi kết nối database:
```bash
# Kiểm tra MongoDB container đang chạy
docker-compose ps mongodb

# Xem logs
docker-compose logs mongodb
```

### Lỗi validation:
- Đảm bảo `name` của tenant là unique
- Đảm bảo `dbUri` đúng format và có quyền truy cập
- Đảm bảo `email` hợp lệ

### Lỗi authentication:
- Kiểm tra JWT token có đúng format
- Đảm bảo `tenantId` và `userId` trong token khớp với database

---

## Environment Variables

Đảm bảo các biến môi trường sau được set:

```bash
APP_PORT=5000
ADMIN_DB_URI=mongodb://admin:admin123@mongodb:27017/admin_db?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this
SALT_ROUNDS=10
NODE_ENV=production
```

