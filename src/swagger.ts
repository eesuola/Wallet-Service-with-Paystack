import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Secure Wallet Service API",
      version: "1.0.0",
      description:
        "A robust and secure backend service for wallet management, fund transfers, and payment processing with Google OAuth authentication.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3030",
        description: "Development Server",
      },
      {
        url: "http://localhost:3031",
        description: "Testing Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for user authentication",
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API key for programmatic access",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID (UUID)",
            },
            email: {
              type: "string",
              description: "User email address",
            },
            googleId: {
              type: "string",
              description: "Google OAuth ID",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Wallet: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Wallet ID (UUID)",
            },
            userId: {
              type: "string",
              description: "User ID",
            },
            balance: {
              type: "number",
              description: "Wallet balance in currency",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Transaction ID (UUID)",
            },
            walletId: {
              type: "string",
              description: "Wallet ID",
            },
            type: {
              type: "string",
              enum: ["deposit", "transfer", "withdrawal"],
              description: "Type of transaction",
            },
            amount: {
              type: "number",
              description: "Transaction amount",
            },
            status: {
              type: "string",
              enum: ["pending", "completed", "failed"],
              description: "Transaction status",
            },
            reference: {
              type: "string",
              description: "Unique transaction reference",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        ApiKey: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "API Key ID (UUID)",
            },
            key: {
              type: "string",
              description: "The API key value",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
                enum: ["read", "deposit", "transfer"],
              },
              description: "Permissions granted to the key",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              description: "Key expiration date",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
            statusCode: {
              type: "number",
              description: "HTTP status code",
            },
          },
        },
      },
    },
    paths: {
      "/": {
        get: {
          tags: ["Health Check"],
          summary: "API Health Check",
          description: "Verify that the Wallet Service API is running",
          responses: {
            "200": {
              description: "API is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Wallet Service API",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/google": {
        get: {
          tags: ["Authentication"],
          summary: "Initiate Google OAuth Login",
          description:
            "Redirects user to Google's OAuth consent screen for authentication",
          responses: {
            "302": {
              description: "Redirect to Google OAuth page",
            },
            "500": {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/google/callback": {
        get: {
          tags: ["Authentication"],
          summary: "Google OAuth Callback",
          description:
            "Handles Google OAuth callback and returns JWT token on successful authentication",
          parameters: [
            {
              name: "code",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              description: "Authorization code from Google",
            },
          ],
          responses: {
            "200": {
              description: "Successfully authenticated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: {
                        type: "string",
                        description: "JWT token for authenticated user",
                      },
                      user: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Authentication failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/failure": {
        get: {
          tags: ["Authentication"],
          summary: "Authentication Failure Handler",
          description: "Endpoint for failed authentication attempts",
          responses: {
            "401": {
              description: "Authentication failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/wallet/balance": {
        get: {
          tags: ["Wallet"],
          summary: "Get Wallet Balance",
          description:
            "Retrieve the current balance of the authenticated user's wallet",
          security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
          responses: {
            "200": {
              description: "Successfully retrieved wallet balance",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      balance: {
                        type: "number",
                        example: 5000.5,
                      },
                      currency: {
                        type: "string",
                        example: "NGN",
                      },
                      walletId: {
                        type: "string",
                        example: "550e8400-e29b-41d4-a716-446655440000",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized - Missing or invalid authentication",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "403": {
              description: "Forbidden - Insufficient permissions",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/wallet/transactions": {
        get: {
          tags: ["Wallet"],
          summary: "Get Transaction History",
          description:
            "Retrieve transaction history for the authenticated user's wallet",
          security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: {
                type: "integer",
                example: 10,
              },
              description: "Maximum number of transactions to return",
            },
            {
              name: "offset",
              in: "query",
              schema: {
                type: "integer",
                example: 0,
              },
              description: "Number of transactions to skip",
            },
          ],
          responses: {
            "200": {
              description: "Successfully retrieved transaction history",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      transactions: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Transaction",
                        },
                      },
                      total: {
                        type: "integer",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized - Missing or invalid authentication",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "403": {
              description: "Forbidden - Insufficient permissions",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/wallet/deposit": {
        post: {
          tags: ["Wallet"],
          summary: "Initiate Fund Deposit",
          description: "Initiate a fund deposit to wallet via Paystack",
          security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["amount", "email"],
                  properties: {
                    amount: {
                      type: "number",
                      example: 1000,
                      description: "Amount to deposit in currency units",
                    },
                    email: {
                      type: "string",
                      example: "user@example.com",
                      description: "Email address for the transaction",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Deposit initiated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      authorizationUrl: {
                        type: "string",
                        description: "URL to complete payment on Paystack",
                      },
                      reference: {
                        type: "string",
                        description: "Unique transaction reference",
                      },
                      accessCode: {
                        type: "string",
                        description: "Paystack access code",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid request parameters",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized - Missing or invalid authentication",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "403": {
              description: "Forbidden - Insufficient permissions",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/wallet/deposit/{reference}/status": {
        get: {
          tags: ["Wallet"],
          summary: "Get Deposit Status",
          description: "Check the status of a deposit transaction",
          security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
          parameters: [
            {
              name: "reference",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              description: "Unique transaction reference",
            },
          ],
          responses: {
            "200": {
              description: "Successfully retrieved deposit status",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: {
                        type: "string",
                        enum: ["pending", "completed", "failed"],
                      },
                      amount: {
                        type: "number",
                      },
                      reference: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized - Missing or invalid authentication",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "404": {
              description: "Transaction not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/wallet/transfer": {
        post: {
          tags: ["Wallet"],
          summary: "Transfer Funds",
          description:
            "Transfer funds from authenticated user's wallet to another user's wallet",
          security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["recipientId", "amount"],
                  properties: {
                    recipientId: {
                      type: "string",
                      example: "550e8400-e29b-41d4-a716-446655440001",
                      description: "User ID of the transfer recipient",
                    },
                    amount: {
                      type: "number",
                      example: 500.5,
                      description: "Amount to transfer",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Transfer completed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      transactionId: {
                        type: "string",
                      },
                      amount: {
                        type: "number",
                      },
                      recipient: {
                        type: "string",
                      },
                      status: {
                        type: "string",
                        example: "completed",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid request parameters or insufficient balance",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized - Missing or invalid authentication",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "403": {
              description: "Forbidden - Insufficient permissions",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "404": {
              description: "Recipient not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/keys/create": {
        post: {
          tags: ["API Keys"],
          summary: "Create API Key",
          description: "Generate a new API key with specified permissions",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["permissions"],
                  properties: {
                    permissions: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: ["read", "deposit", "transfer"],
                      },
                      example: ["read", "deposit"],
                      description: "Permissions to grant to the API key",
                    },
                    expiresIn: {
                      type: "number",
                      example: 86400,
                      description:
                        "Expiration time in seconds (default: 30 days)",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "API key created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      apiKey: {
                        type: "string",
                        description: "The newly generated API key (shown once)",
                      },
                      permissions: {
                        type: "array",
                        items: {
                          type: "string",
                        },
                      },
                      expiresAt: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid permissions or request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized - Missing or invalid JWT token",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/keys/rollover": {
        post: {
          tags: ["API Keys"],
          summary: "Rollover API Key",
          description:
            "Generate a new API key to replace an expired one with the same permissions",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["oldKeyId"],
                  properties: {
                    oldKeyId: {
                      type: "string",
                      example: "550e8400-e29b-41d4-a716-446655440000",
                      description: "ID of the API key to rollover",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "API key rolled over successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      newApiKey: {
                        type: "string",
                        description: "The newly generated API key (shown once)",
                      },
                      permissions: {
                        type: "array",
                        items: {
                          type: "string",
                        },
                      },
                      expiresAt: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid request or API key not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized - Missing or invalid JWT token",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/wallet/paystack/webhook": {
        post: {
          tags: ["Webhooks"],
          summary: "Handle Paystack Webhook",
          description:
            "Receives and processes webhook notifications from Paystack for payment events",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    event: {
                      type: "string",
                      example: "charge.success",
                    },
                    data: {
                      type: "object",
                      properties: {
                        reference: {
                          type: "string",
                        },
                        amount: {
                          type: "number",
                        },
                        status: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Webhook processed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Invalid webhook payload or signature",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const specs = swaggerJsdoc(options);
