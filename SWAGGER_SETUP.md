# API Documentation - Swagger Setup

Your Wallet Service API now has interactive Swagger/OpenAPI documentation!

## Accessing the Documentation

Once the server is running, visit:

```
https://wallet-service-with-paystack.onrender.com/api-docs
```

## What You Get

✅ **Interactive API Documentation**

- View all available endpoints
- See request/response schemas
- View authentication requirements
- Read detailed descriptions of each endpoint

✅ **Try It Out Feature**

- Test endpoints directly from the browser
- Automatically formats requests
- See live responses
- Perfect for testing during development

✅ **Professional API Specification**

- Machine-readable OpenAPI 3.0 format
- Can be used to auto-generate client libraries
- Share with external teams
- Standards-compliant specification

## Running the Server

Start your development server:

```bash
npm run dev
```

Then navigate to `https://wallet-service-with-paystack.onrender.com/api-docs` in your browser.

## Endpoints Documented

The following endpoints are documented in Swagger:

### Authentication

- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback handler
- `GET /auth/failure` - Authentication failure handler

### Wallet Operations

- `GET /wallet/balance` - Get wallet balance
- `GET /wallet/transactions` - Get transaction history
- `POST /wallet/deposit` - Initiate a deposit
- `GET /wallet/deposit/{reference}/status` - Check deposit status
- `POST /wallet/transfer` - Transfer funds to another user

### API Key Management

- `POST /keys/create` - Create new API key with permissions
- `POST /keys/rollover` - Rollover expired API key

### Webhooks

- `POST /wallet/paystack/webhook` - Paystack webhook handler

### Health Check

- `GET /` - API health check

## Authentication Methods Documented

The Swagger docs show how to use:

1. **Bearer Token (JWT)** - For user authentication

   ```
   Authorization: Bearer <your_jwt_token>
   ```

2. **API Key** - For programmatic access
   ```
   x-api-key: <your_api_key>
   ```

## Sharing Documentation

You can share the Swagger endpoint with clients and team members. They can:

- View all available endpoints
- Understand request/response formats
- Test endpoints in real-time
- Generate client libraries (many tools support OpenAPI 3.0)

## Additional Notes

- The Swagger UI is automatically generated from the OpenAPI specification
- Your `README.md` provides additional context and setup instructions
- Both Bruno (for manual testing) and Swagger (for documentation) complement each other
- The specification is in OpenAPI 3.0 format, which is an industry standard

For more information on OpenAPI/Swagger, visit: https://swagger.io/
