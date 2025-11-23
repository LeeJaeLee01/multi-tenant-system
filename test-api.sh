#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="${BASE_URL:-http://localhost:5000}"

echo -e "${BLUE}=== Testing Multi-Tenant API ===${NC}"
echo ""

# Generate unique tenant name
TIMESTAMP=$(date +%s)
TENANT_NAME="test-tenant-${TIMESTAMP}"
DB_NAME="test_tenant_db_${TIMESTAMP}"

# Test 1: Create Tenant
echo -e "${YELLOW}1. Creating new tenant: ${TENANT_NAME}${NC}"
TENANT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/add \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${TENANT_NAME}\",
    \"dbUri\": \"mongodb://admin:admin123@mongodb:27017/${DB_NAME}?authSource=admin\",
    \"email\": \"admin@${TENANT_NAME}.com\"
  }")

HTTP_CODE=$(echo "$TENANT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$TENANT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Tenant created successfully${NC}"
    echo "Response: $RESPONSE_BODY"
    
    # Extract tenantId and userId (check if jq is available)
    if command -v jq &> /dev/null; then
        TENANT_ID=$(echo $RESPONSE_BODY | jq -r '.responseObject.tenantId')
        USER_ID=$(echo $RESPONSE_BODY | jq -r '.responseObject.userId')
        
        echo -e "${GREEN}Tenant ID: ${TENANT_ID}${NC}"
        echo -e "${GREEN}User ID: ${USER_ID}${NC}"
    else
        echo -e "${YELLOW}Note: Install 'jq' for automatic ID extraction${NC}"
        echo "Please extract tenantId and userId manually from the response above"
        read -p "Enter Tenant ID: " TENANT_ID
        read -p "Enter User ID: " USER_ID
    fi
else
    echo -e "${RED}✗ Failed to create tenant (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi

echo ""

# Test 2: Login
if [ -n "$TENANT_ID" ] && [ -n "$USER_ID" ]; then
    echo -e "${YELLOW}2. Logging in with Tenant ID and User ID${NC}"
    LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/login \
      -H "Content-Type: application/json" \
      -d "{
        \"_id\": \"${USER_ID}\",
        \"tenantId\": \"${TENANT_ID}\"
      }")
    
    HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Login successful${NC}"
        echo "Response: $RESPONSE_BODY"
        
        if command -v jq &> /dev/null; then
            ACCESS_TOKEN=$(echo $RESPONSE_BODY | jq -r '.responseObject.accessToken')
            echo -e "${GREEN}Access Token: ${ACCESS_TOKEN}${NC}"
        else
            echo -e "${YELLOW}Note: Install 'jq' for automatic token extraction${NC}"
        fi
    else
        echo -e "${RED}✗ Login failed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $RESPONSE_BODY"
    fi
else
    echo -e "${RED}✗ Cannot test login - missing Tenant ID or User ID${NC}"
fi

echo ""
echo -e "${BLUE}=== Testing Complete ===${NC}"

