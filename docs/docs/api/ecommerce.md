# 🛒 API: E-commerce y Tienda

Endpoints para la gestión de productos, órdenes y donaciones.

## 1. Productos

### `GET /ecommerce/api/v1/products/`
**Función**: `getProducts(category, sellerId)`
- **Descripción**: Catálogo de productos con filtros opcionales.

### `POST /ecommerce/api/v1/products/`
**Función**: `createProduct(formData)`
- **Descripción**: Crea un producto con carga de imagen a S3 (admin/vendedor).

## 2. Órdenes y Reseñas

### `POST /ecommerce/api/v1/orders/`
**Función**: `createOrder(data)`
- **Descripción**: Genera una nueva compra.

### `POST /ecommerce/api/v1/products/{product_id}/reviews`
**Función**: `createReview(productId, review)`
- **Descripción**: Permite a un usuario calificar un producto.

## 3. Donaciones

### `POST /ecommerce/api/v1/donations/`
**Función**: `createDonation(amount, message)`
- **Descripción**: Registra una donación al proyecto.
