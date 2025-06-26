# Bundle API Documentation

## Overview
The Bundle API allows you to manage product/service bundles for your business. All endpoints require authentication and operate within the context of the authenticated business.

**Base URL:** `/api/bundles`

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Data Types

### ProductStatus
```typescript
enum ProductStatus {
  ACTIVE = 'ACTIVO',
  INACTIVE = 'INACTIVO', 
  OUT_OF_STOCK = 'SIN_STOCK'
}
```

### Price Object
```typescript
{
  amount: number,      // Minimum: 0
  currency: string     // 3-letter currency code (e.g., "USD", "EUR")
}
```

### Media Object
```typescript
{
  url: string,         // Valid URL to the file
  type: string,        // File type/MIME type
  caption?: string,    // Optional caption
  filename?: string,   // Optional filename
  mimetype?: string    // Optional MIME type
}
```

### Bundle Item
```typescript
{
  itemId: string,      // ID of the product or service
  itemType: "product" | "service",
  quantity: number     // Must be positive integer
}
```

### Bundle Response Object
```typescript
{
  id: string,
  businessId: string,
  sku: string,
  name: string,
  description: string,
  items: Array<{
    id: string,
    itemId: string,
    quantity: number,
    type: "product" | "service"
  }>,
  price: Price,
  cost: Price,
  status: ProductStatus,
  tagIds: string[],
  files: Media[],
  createdAt: string,   // ISO date string
  tags?: Array<Tag>    // Only included in individual bundle retrieval
}
```

## Endpoints

### 1. Create Bundle
**POST** `/api/bundles/`

Creates a new bundle for the authenticated business.

**Request Body:**
```typescript
{
  sku: string,                    // Required, min 1 character
  name: string,                   // Required, min 1 character  
  description?: string,           // Optional, defaults to ""
  price: {                        // Required
    amount: number,               // Min: 0
    currency: string              // 3-letter code
  },
  cost: {                         // Required
    amount: number,               // Min: 0
    currency: string              // 3-letter code
  },
  items: Array<{                  // Required, min 1 item
    itemId: string,
    itemType: "product" | "service",
    quantity: number              // Positive integer
  }>,
  status?: ProductStatus,         // Optional, defaults to "ACTIVE"
  tagIds?: string[],             // Optional, defaults to []
  files?: Array<{                // Optional, defaults to []
    url: string,                 // Valid URL
    type: string
  }>
}
```

**Example Request:**
```json
{
  "sku": "BUNDLE-001",
  "name": "Haircut & Styling Package",
  "description": "Complete haircut with professional styling",
  "price": {
    "amount": 50.00,
    "currency": "USD"
  },
  "cost": {
    "amount": 30.00,
    "currency": "USD"
  },
  "items": [
    {
      "itemId": "service-haircut-123",
      "itemType": "service",
      "quantity": 1
    },
    {
      "itemId": "service-styling-456",
      "itemType": "service", 
      "quantity": 1
    }
  ],
  "status": "ACTIVO",
  "tagIds": ["tag-1", "tag-2"],
  "files": [
    {
      "url": "https://example.com/bundle-image.jpg",
      "type": "image/jpeg"
    }
  ]
}
```

**Response:**
- **201 Created:**
```json
{
  "message": "Bundle created successfully"
}
```

### 2. Get Bundle by ID
**GET** `/api/bundles/:id`

Retrieves a specific bundle by its ID. Only returns bundles belonging to the authenticated business.

**Path Parameters:**
- `id` (string): The bundle ID

**Response:**
- **200 OK:** Bundle object with populated tags
```json
{
  "id": "bundle-123",
  "businessId": "business-456", 
  "sku": "BUNDLE-001",
  "name": "Haircut & Styling Package",
  "description": "Complete haircut with professional styling",
  "items": [
    {
      "id": "item-1",
      "itemId": "service-haircut-123",
      "quantity": 1,
      "type": "service"
    }
  ],
  "price": {
    "amount": 50.00,
    "currency": "USD"
  },
  "cost": {
    "amount": 30.00,
    "currency": "USD"
  },
  "status": "ACTIVO",
  "tagIds": ["tag-1", "tag-2"],
  "files": [
    {
      "url": "https://example.com/bundle-image.jpg",
      "type": "image/jpeg"
    }
  ],
  "createdAt": "2023-10-01T12:00:00.000Z",
  "tags": [
    {
      "id": "tag-1",
      "name": "Popular"
    }
  ]
}
```

### 3. Get All Bundles
**GET** `/api/bundles/`

Retrieves all bundles for the authenticated business with optional filtering.

**Query Parameters:**
- `query` (string, optional): Search term to filter by name, description, or SKU
- `tagIds` (string | string[], optional): Filter by tag IDs (comma-separated string or array)
- `status` (string, optional): Filter by status

**Example Requests:**
```
GET /api/bundles/
GET /api/bundles/?query=haircut
GET /api/bundles/?tagIds=tag-1,tag-2
GET /api/bundles/?status=ACTIVO
GET /api/bundles/?query=styling&tagIds=tag-1&status=ACTIVO
```

**Response:**
- **200 OK:** Array of bundle objects
```json
[
  {
    "id": "bundle-123",
    "businessId": "business-456",
    "sku": "BUNDLE-001", 
    "name": "Haircut & Styling Package",
    "description": "Complete haircut with professional styling",
    "items": [...],
    "price": {...},
    "cost": {...},
    "status": "ACTIVO",
    "tagIds": ["tag-1"],
    "files": [...],
    "createdAt": "2023-10-01T12:00:00.000Z"
  }
]
```

### 4. Update Bundle
**PUT** `/api/bundles/:id`

Updates an existing bundle. Only bundles belonging to the authenticated business can be updated.

**Path Parameters:**
- `id` (string): The bundle ID

**Request Body:** (All fields optional)
```typescript
{
  sku?: string,                   // Min 1 character
  name?: string,                  // Min 1 character
  description?: string,
  price?: {
    amount: number,               // Min: 0
    currency: string              // 3-letter code
  },
  cost?: {
    amount: number,               // Min: 0  
    currency: string              // 3-letter code
  },
  items?: Array<{                 // Min 1 item if provided
    itemId: string,
    itemType: "product" | "service",
    quantity: number              // Positive integer
  }>,
  status?: ProductStatus,
  tagIds?: string[],
  files?: Array<{
    url: string,                  // Valid URL
    type: string
  }>
}
```

**Example Request:**
```json
{
  "name": "Premium Haircut & Styling Package",
  "price": {
    "amount": 60.00,
    "currency": "USD"
  },
  "status": "ACTIVO"
}
```

**Response:**
- **200 OK:**
```json
{
  "message": "Bundle updated successfully"
}
```

### 5. Delete Bundle
**DELETE** `/api/bundles/:id`

Deletes a bundle. Only bundles belonging to the authenticated business can be deleted.

**Path Parameters:**
- `id` (string): The bundle ID

**Response:**
- **204 No Content:**
```json
{
  "message": "Bundle deleted successfully"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "type": "string",
  "title": "string", 
  "status": number,
  "detail": "string",
  "instance": "string"
}
```

### Common Error Status Codes:
- **400 Bad Request:** Invalid request data or validation errors
- **401 Unauthorized:** Missing or invalid authentication token
- **403 Forbidden:** User doesn't have permission to access the resource
- **404 Not Found:** Bundle not found or doesn't belong to authenticated business
- **422 Unprocessable Entity:** Business logic validation errors
- **500 Internal Server Error:** Server error

### Example Error Response:
```json
{
  "type": "ValidationError",
  "title": "Validation Failed",
  "status": 400,
  "detail": "The 'sku' field is required and must be at least 1 character long",
  "instance": "/api/bundles/"
}
```

## Implementation Examples

### JavaScript/TypeScript (fetch)

```typescript
// Create bundle
const createBundle = async (bundleData: any) => {
  const response = await fetch('/api/bundles/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bundleData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create bundle');
  }
  
  return response.json();
};

// Get all bundles with filters
const getBundles = async (filters: {
  query?: string;
  tagIds?: string[];
  status?: string;
} = {}) => {
  const params = new URLSearchParams();
  
  if (filters.query) params.append('query', filters.query);
  if (filters.tagIds?.length) params.append('tagIds', filters.tagIds.join(','));
  if (filters.status) params.append('status', filters.status);
  
  const response = await fetch(`/api/bundles/?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch bundles');
  }
  
  return response.json();
};

// Update bundle
const updateBundle = async (id: string, updates: any) => {
  const response = await fetch(`/api/bundles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update bundle');
  }
  
  return response.json();
};
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface Bundle {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: { amount: number; currency: string };
  status: string;
  // ... other fields
}

const useBundles = (filters?: { query?: string; tagIds?: string[]; status?: string }) => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBundles();
  }, [filters]);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const data = await getBundles(filters);
      setBundles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bundles');
    } finally {
      setLoading(false);
    }
  };

  return { bundles, loading, error, refetch: fetchBundles };
};
```

## Best Practices

1. **Always handle errors:** Check response status and handle error responses appropriately
2. **Validate data:** Ensure all required fields are present before making requests
3. **Use proper HTTP methods:** POST for creation, PUT for updates, DELETE for deletion
4. **Include authentication:** Always include the Authorization header with a valid token
5. **Handle loading states:** Show loading indicators during API calls
6. **Cache responses:** Consider caching bundle lists to improve performance
7. **Implement retry logic:** Handle temporary network failures gracefully
8. **Validate business logic:** Ensure items exist before adding them to bundles
9. **Handle file uploads:** Use proper file upload mechanisms for bundle images
10. **Use TypeScript:** Leverage type safety for better development experience