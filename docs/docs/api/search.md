---
sidebar_position: 4
---

# Global Search (Michi-Explorer)

This endpoint provides cross-service global search functionality designed specifically for the **Michi-Explorer** (Command Palette) in the frontend. It parallelizes search queries across multiple entities.

## Base URL

`/core/api/v1/search`

## Endpoints

### Get Global Search Results

`GET /`

Searches across `pets`, `clinics`, and `products` using a unified query. Results are limited to the top 3 matches per category to keep the payload small and fast for the UI.

**Parameters:**

*   `q` (string, required): The search term. Must be at least 2 characters long.

**Response (200 OK):**

```json
{
  "pets": [
    {
      "id": "uuid",
      "name": "Firulais",
      "species": "Perro",
      "breed": "Mestizo"
    }
  ],
  "clinics": [
    {
      "id": "uuid",
      "name": "Veterinaria San Roque",
      "city": "CDMX",
      "address": "Av. Principal 123"
    }
  ],
  "products": [
    {
      "id": "uuid",
      "name": "Croquetas Premium",
      "price": 550.0
    }
  ]
}
```

## Performance Notes
- The endpoint leverages raw PostgreSQL `ILIKE` queries combined with `LIMIT 3` to guarantee fast response times (< 50ms) suitable for `debounced` keystroke requests.
- Only active entities (`is_active = true`) are returned for pets and products.
