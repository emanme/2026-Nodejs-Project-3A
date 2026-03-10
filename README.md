# Simple Store API (Node.js + Express + MySQL)

This repository is designed for **real-world Git workflow practice**.

## Branches
- `main` — production/stable
- `release` — upcoming version branch with **35 seeded issues** (bugs, missing features, and improvements)

## Student Workflow
1. Checkout `release`
2. Create a branch using:
   `####-lastname+initial-3word-description`
   Example: `0402-delacruzj-payment-verification-database`
3. Fix the assigned issue
4. Push and open PR → `release`

---

## Quick Start

```bash
npm install
docker compose up -d
cp .env.example .env
npm run db:init
npm run dev
```

---

## Main Endpoints

- `POST /users/register`
- `POST /users/login`
- `GET /users/me`
- `GET /products` (pagination + search)
- `POST /products` (auth)
- `PUT /products/:id` (auth)
- `DELETE /products/:id` (auth)
- `POST /orders` (auth)
- `GET /orders` (auth)
- `GET /health`

---

# API Documentation

## Base URL

```text
http://localhost:3000
```

## Authentication

Protected endpoints require a JWT token.

Example header:

```http
Authorization: Bearer <your_token>
```

---

# Users

## Register User
**POST /users/register**

Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Example Response

```json
{
  "message": "User registered successfully"
}
```

---

## Login User
**POST /users/login**

Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Example Response

```json
{
  "token": "jwt_token_here"
}
```

---

## Get Current User
**GET /users/me**

Authentication required.

Example Response

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

# Products

## Get All Products
**GET /products**

Supports pagination and search.

Example request:

```text
GET /products?page=1&limit=10&search=phone
```

Example Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Phone",
      "price": 10000,
      "stock": 5
    }
  ],
  "page": 1,
  "limit": 10
}
```

---

## Create Product
**POST /products**

Authentication required.

Request Body

```json
{
  "name": "Sample Product",
  "price": 100,
  "stock": 10
}
```

Example Response

```json
{
  "message": "Product created successfully"
}
```

---

## Update Product
**PUT /products/:id**

Authentication required.

Example Response

```json
{
  "message": "Product updated successfully"
}
```

---

## Delete Product
**DELETE /products/:id**

Authentication required.

Example Response

```json
{
  "message": "Product deleted successfully"
}
```

---

# Orders

## Create Order
**POST /orders**

Authentication required.

Request Body

```json
{
  "productId": 1,
  "quantity": 2
}
```

Example Response

```json
{
  "message": "Order created successfully"
}
```

---

## Get Orders
**GET /orders**

Authentication required.

Example Response

```json
[
  {
    "id": 1,
    "productId": 1,
    "quantity": 2,
    "total": 200
  }
]
```

---

# Health Check

## GET /health

Example Response

```json
{
  "status": "ok"
}
```

---

# Common Status Codes

- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

---

## Release Issues

See **ISSUES.md**. In `release`, issues are tagged in code as `ISSUE-####`. 