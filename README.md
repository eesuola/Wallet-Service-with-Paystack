# Secure Wallet Service API 💰

## Overview

A robust and secure backend service built with TypeScript, Node.js, and Express, leveraging TypeORM for efficient database interactions. It provides comprehensive wallet management, secure fund transfers, and integrated Google OAuth for authentication, alongside a flexible API key system for controlled third-party access and Paystack integration for payment processing.

## Features

- 🔐 **User Authentication**: Secure user login via Google OAuth 2.0 and JWTs.
- 💳 **Wallet Management**: Create and manage individual user wallets with balance tracking.
- 💸 **Fund Deposits**: Initiate and verify fund deposits through seamless Paystack integration.
- ➡️ **Fund Transfers**: Securely transfer funds between user wallets with atomic transactions.
- 📜 **Transaction History**: View detailed and comprehensive transaction records for each wallet.
- 🔑 **API Key Management**: Generate, manage, and rollover API keys with granular permissions (`read`, `deposit`, `transfer`) and defined expiry.
- 📞 **Webhook Processing**: Efficiently handle Paystack webhook events for real-time transaction updates and wallet crediting.
- 🗄️ **Database ORM**: Robust and reliable data persistence layer using TypeORM with PostgreSQL.
- 🛡️ **Flexible Authorization**: Supports both JWT token-based authentication for interactive users and API key-based authentication for programmatic access, offering fine-grained permission control.

## Getting Started

To get this project up and running on your local machine, follow these steps.

### Installation

1.  ⭐ **Clone the repository**:
    ```bash
    git clone [YOUR_REPOSITORY_URL_HERE]
    cd payment_auth_google
    ```
2.  📦 **Install dependencies**:
    ```bash
    npm install
    ```
3.  ⚙️ **Set up environment variables**:
    Create a `.env` file in the root directory by copying the `.env.example` file and filling in your specific details.

### Environment Variables

All required environment variables are listed below with examples.

- `PORT`: Port for the server to listen on. Example: `3030`
- `NODE_ENV`: Application environment (e.g., `development`, `production`). Example: `development`
- `DB_HOST`: PostgreSQL database host. Example: `localhost`
- `DB_PORT`: PostgreSQL database port. Example: `5432`
- `DB_USERNAME`: PostgreSQL database username. Example: `myuser`
- `DB_PASSWORD`: PostgreSQL database password. Example: `mypassword`
- `DB_NAME`: PostgreSQL database name. Example: `mydatabase`
- `JWT_SECRET`: Secret key for signing JWT tokens. Example: `supersecretjwtkey`
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID. Example: `your_google_client_id_here`
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret. Example: `your_google_client_secret_here`
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL. Example: `http://localhost:3030/auth/google/callback`
- `PAYSTACK_SECRET_KEY`: Paystack secret key. Example:
- `PAYSTACK_PUBLIC_KEY`: Paystack public key. Example: `
- `SESSION_SECRET`: Secret key for Express session. Example: `your-express-session-secret`

### Running the application

1.  🚀 **Start the database**: Ensure your PostgreSQL database instance is running and accessible.
2.  🛠️ **Database Synchronization**: The application is configured with `synchronize: true` in TypeORM, meaning tables will be created or updated automatically on the first run. For production environments, it is recommended to manage schema changes using TypeORM migrations.
3.  💻 **Start the development server**:
    ```bash
    npm run dev
    ```
    The server will be running on `http://localhost:3030` (or your specified `PORT`).
4.  📦 **Build and Start (Production)**:
    ```bash
    npm run build
    npm start
    ```

## API Documentation

### Base URL

`http://localhost:3030` (or your configured `PORT` environment variable)

### Authentication

This API employs two primary authentication mechanisms:

1.  **JWT Token (Bearer Authentication)**: Utilized for direct user authentication after a successful Google OAuth login.
    - To authenticate, include the JWT in the `Authorization` header: `Bearer <your_jwt_token>`
2.  **API Key (Header Authentication)**: Designed for programmatic access by services or third-party integrations with specific, granular permissions.
    - To authenticate, include the API key in the `x-api-key` header: `<your_api_key>`

Each endpoint's documentation explicitly indicates which authentication method(s) it supports and any required permissions.

### Endpoints

#### GET /auth/google

**Overview**: Initiates the Google OAuth 2.0 authentication flow, redirecting the user to Google's login page.
**Authentication**: None (handled by the Google OAuth redirect process)
**Request**: None
**Response**: Redirects the user's browser to the Google authentication page.
**Errors**:

- `500 Internal Server Error`: An unexpected error occurred during the redirection process.

#### GET /auth/google/callback

**Overview**: This is the designated callback URL for Google OAuth 2.0. Upon successful authentication with Google, this endpoint processes the authorization code, retrieves user data, and generates a JSON Web Token (JWT) for the authenticated user.
**Authentication**: None (authentication handled by Google OAuth callback)
**Request**: None
**Response**:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZjY0NDkyOS1lZDQ4LTQ3YzQtODM1ZS1lYTU5ZGViMWZiZGQiLCJlbWFpbCI6ImJwbHVzaG9tZXNAZ21haWwuY29tIiwiaWF0IjoxNzY1MjcyMTAwLCJleHAiOjE3NjU4NzY5MDB9.wKhoF977piCMFpLWKmNrr4afbeKmuHvmYXeyNOvOHVI",
  "user": {
    "id": "8f644929-ed48-47c4-835e-ea59deb1fbdd",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors**:

- `401 Unauthorized`: Authentication with Google failed or the user could not be processed.
- `500 Internal Server Error`: An unexpected error occurred on the server while processing the callback.

#### POST /keys/create

**Overview**: Creates a new API key for the authenticated user, specifying its name, permissions, and expiry. Each user is limited to a maximum of 5 active API keys.
**Authentication**: JWT (Bearer Token)
**Request**:

```json
{
  "name": "wallet-service-access",
  "permissions": ["deposit", "transfer", "read"],
  "expiry": "1D"
}
```

**Request Fields**:

- `name` (string, required): A meaningful identifier for the API key.
- `permissions` (array of string, required): An array defining the allowed actions. Valid values include: `"deposit"`, `"transfer"`, `"read"`.
- `expiry` (string, required): The duration until the API key automatically expires. Valid options are: `"1H"` (1 Hour), `"1D"` (1 Day), `"1M"` (1 Month), or `"1Y"` (1 Year).
  **Response**:

```json
{
  "api_key": "",
  "expires_at": "2024-12-10T12:00:00.000Z"
}
```

**Errors**:

- `400 Bad Request`: Occurs if required fields are missing, `permissions` array contains invalid values, or the user has already reached the maximum limit of 5 active API keys.
- `401 Unauthorized`: No JWT token provided or the provided token is invalid or expired.
- `500 Internal Server Error`: An unexpected server-side error occurred during API key creation.

#### POST /keys/rollover

**Overview**: Allows an authenticated user to "rollover" an _expired_ API key. This process generates a new API key with the same permissions as the original expired key, but with a newly specified expiry. The old key must be explicitly expired to be eligible for rollover.
**Authentication**: JWT (Bearer Token)
**Request**:

```json
{
  "expired_key_id": "c1f7b0e1-a2c3-4d5e-8f90-1a2b3c4d5e6f",
  "expiry": "1M"
}
```

**Request Fields**:

- `expired_key_id` (string, required): The unique identifier (UUID) of the API key that is being rolled over.
- `expiry` (string, required): The new duration for the generated API key. Valid options: `"1H"`, `"1D"`, `"1M"`, or `"1Y"`.
  **Response**:

```json
{
  "api_key": "",
  "expires_at": "2025-01-10T12:00:00.000Z"
}
```

**Errors**:

- `400 Bad Request`: Encountered if required fields are missing, the specified API key is not yet expired, or the user already has the maximum of 5 active API keys.
- `401 Unauthorized`: No JWT token provided or the provided token is invalid or expired.
- `404 Not Found`: An API key corresponding to the `expired_key_id` could not be found for the authenticated user.
- `500 Internal Server Error`: An unexpected server-side error occurred during the rollover process.

#### GET /wallet/balance

**Overview**: Retrieves the current available balance and the unique wallet number associated with the authenticated user's wallet.
**Authentication**: JWT (Bearer Token) OR API Key with `"read"` permission (via `x-api-key` header).
**Request**: None
**Response**:

```json
{
  "balance": 5000.75,
  "wallet_number": "1234567890123"
}
```

**Errors**:

- `401 Unauthorized`: No authentication credentials provided, or the provided JWT/API key is invalid or expired.
- `403 Forbidden`: The API key used lacks the necessary `"read"` permission to access wallet balance.
- `404 Not Found`: No wallet could be found for the authenticated user.
- `500 Internal Server Error`: An unexpected server-side error occurred while fetching the balance.

#### GET /wallet/transactions

**Overview**: Fetches the complete transaction history for the authenticated user's wallet, presented in descending order by transaction creation date.
**Authentication**: JWT (Bearer Token) OR API Key with `"read"` permission (via `x-api-key` header).
**Request**: None
**Response**:

```json
[
  {
    "id": "e1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    "type": "deposit",
    "amount": 1000.0,
    "status": "success",
    "reference": "dep_1765321023518_b9538656",
    "recipient_wallet_number": null,
    "sender_wallet_number": null,
    "created_at": "2024-12-09T14:30:00.000Z"
  },
  {
    "id": "f1e2d3c4-b5a6-7890-1234-56789abcdef0",
    "type": "transfer_out",
    "amount": 50.0,
    "status": "success",
    "reference": "trx_1765321023518_abcdef12",
    "recipient_wallet_number": "9876543210987",
    "sender_wallet_number": null,
    "created_at": "2024-12-09T14:00:00.000Z"
  }
]
```

**Errors**:

- `401 Unauthorized`: No authentication credentials provided, or the provided JWT/API key is invalid or expired.
- `403 Forbidden`: The API key used lacks the necessary `"read"` permission to access transaction history.
- `404 Not Found`: No wallet could be found for the authenticated user.
- `500 Internal Server Error`: An unexpected server-side error occurred while retrieving transactions.

#### POST /wallet/deposit

**Overview**: Initiates a fund deposit into the authenticated user's wallet through the Paystack payment gateway. This endpoint returns a unique transaction reference and a Paystack authorization URL, which the client should use to redirect the user to complete the payment.
**Authentication**: JWT (Bearer Token) OR API Key with `"deposit"` permission (via `x-api-key` header).
**Request**:

```json
{
  "amount": 3000
}
```

**Request Fields**:

- `amount` (number, required): The monetary amount to be deposited. Must be a positive value.
  **Response**:

```json
{
  "reference": "dep_1765321023518_b9538656",
  "authorization_url": "https://checkout.paystack.com/xxxxxx"
}
```

**Errors**:

- `400 Bad Request`: Provided `amount` is invalid (e.g., zero or negative) or missing.
- `401 Unauthorized`: No authentication credentials provided, or the provided JWT/API key is invalid or expired.
- `403 Forbidden`: The API key used lacks the necessary `"deposit"` permission.
- `404 Not Found`: No wallet could be found for the authenticated user.
- `500 Internal Server Error`: An unexpected server-side error occurred, potentially due to a failure in initializing payment with Paystack.

#### GET /wallet/deposit/:reference/status

**Overview**: Checks the current status of a specific deposit transaction using its unique reference ID. This endpoint directly verifies the transaction status with Paystack.
**Authentication**: JWT (Bearer Token) OR API Key with `"read"` permission (via `x-api-key` header).
**Request**: None
**Response**:

```json
{
  "reference": "dep_1765321023518_b9538656",
  "status": "success",
  "amount": 3000.0,
  "paystack_status": "success"
}
```

**Errors**:

- `401 Unauthorized`: No authentication credentials provided, or the provided JWT/API key is invalid or expired.
- `403 Forbidden`: The API key used lacks the necessary `"read"` permission.
- `404 Not Found`: A transaction with the specified `reference` could not be found.
- `500 Internal Server Error`: An unexpected server-side error occurred, potentially due to a failure in verifying payment with Paystack.

#### POST /wallet/transfer

**Overview**: Facilitates the transfer of funds from the authenticated user's wallet to another specified recipient wallet number.
**Authentication**: JWT (Bearer Token) OR API Key with `"transfer"` permission (via `x-api-key` header).
**Request**:

```json
{
  "wallet_number": "3601548540332",
  "amount": 100
}
```

**Request Fields**:

- `wallet_number` (string, required): The unique wallet number of the intended recipient.
- `amount` (number, required): The monetary amount to be transferred. Must be a positive value.
  **Response**:

```json
{
  "status": "success",
  "message": "Transfer completed"
}
```

**Errors**:

- `400 Bad Request`: Occurs if the `wallet_number` or `amount` is invalid, the sender has an `Insufficient balance`, or the transfer attempts to send funds to the `sender's own wallet`.
- `401 Unauthorized`: No authentication credentials provided, or the provided JWT/API key is invalid or expired.
- `403 Forbidden`: The API key used lacks the necessary `"transfer"` permission.
- `404 Not Found`: Either the sender's or recipient's wallet could not be found.
- `500 Internal Server Error`: An unexpected server-side error occurred during the fund transfer process.

#### POST /wallet/paystack/webhook

**Overview**: This endpoint serves as the receiver for Paystack webhook notifications. It is crucial for asynchronously updating transaction statuses and crediting user wallets upon successful payment events (e.g., `charge.success`).
**Authentication**: Paystack Signature Verification (Typically enabled in production to ensure request authenticity, though it appears to be commented out in the provided code snippet).
**Request**: A JSON payload sent by Paystack detailing a transaction event.
**Response**:

```json
{
  "status": true
}
```

**Errors**:

- `401 Unauthorized`: May occur if Paystack signature verification is enabled and the signature is invalid.
- `404 Not Found`: The transaction referenced in the webhook payload could not be found in the database.
- `500 Internal Server Error`: An unexpected server-side error occurred while processing the webhook event.

## Usage

This API is designed for flexible integration, serving both direct user interaction and automated service-to-service communication.

1.  **User Authentication**: For client applications where users directly interact, direct users to the `/auth/google` endpoint to initiate Google OAuth. Upon successful authentication, the `/auth/google/callback` endpoint will return a JWT. This token should be included in the `Authorization: Bearer <token>` header for all subsequent user-specific requests requiring JWT authentication.

2.  **Service-to-Service Interaction**: For backend services or third-party integrations requiring programmatic access, create API keys using the `POST /keys/create` endpoint. Assign specific permissions (e.g., `read`, `deposit`, `transfer`) relevant to the service's function. The generated API key should then be included in the `x-api-key` header for authorized requests.

3.  **Fund Deposits**: To allow users to deposit funds into their wallets, initiate the process by calling `POST /wallet/deposit`. The API will respond with an `authorization_url`. Redirect the user's browser to this URL to complete the payment via Paystack's interface. Once the payment is successfully processed by Paystack, a webhook notification will be sent to `/wallet/paystack/webhook`, which automatically updates the transaction status and credits the user's wallet.

4.  **Fund Transfers**: To enable transfers between user wallets, utilize the `POST /wallet/transfer` endpoint. Ensure the authenticated entity (either a user via JWT or a service via API key) possesses the `transfer` permission and that the sender's wallet has sufficient balance to cover the transaction.

## Technologies Used

| Technology                                                                                                        | Description                                                                                                                             |
| :---------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) | Primary language for type-safe and scalable applications, enhancing code quality and maintainability.                                   |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)        | JavaScript runtime for building high-performance, efficient, and scalable server-side applications.                                     |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)    | A minimalist, flexible Node.js web application framework that provides a robust set of features for web and mobile applications.        |
| ![TypeORM](https://img.shields.io/badge/TypeORM-FF4F00?style=for-the-badge&logo=typeorm&logoColor=white)          | An Object-Relational Mapper (ORM) for TypeScript and JavaScript, simplifying database interactions with PostgreSQL.                     |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) | A powerful, open-source object-relational database system known for its reliability, feature robustness, and performance.               |
| ![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logo=passport&logoColor=white) | Flexible authentication middleware for Node.js, integrated here for secure Google OAuth 2.0 authentication.                             |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)          | JSON Web Tokens are used for securely transmitting information between parties as a JSON object, facilitating stateless authentication. |
| ![Paystack](https://img.shields.io/badge/Paystack-27AE60?style=for-the-badge&logo=paystack&logoColor=white)       | An African payment gateway seamlessly integrated for processing online deposits and managing transaction webhooks.                      |
| ![Axios](https://img.shields.io/badge/Axios-6710F5?style=for-the-badge&logo=axios&logoColor=white)                | A popular promise-based HTTP client for the browser and Node.js, used for external API integrations (e.g., Paystack).                   |
| ![Dotenv](https://img.shields.io/badge/Dotenv-FFE053?style=for-the-badge&logo=dotenv&logoColor=black)             | A zero-dependency module that loads environment variables from a `.env` file into `process.env`.                                        |

## Contributing

We warmly welcome contributions to this project! To contribute and help us improve this service:

- ⭐ **Fork the repository**: Start by forking the project to your GitHub account.
- 🌿 **Create a new branch**: For any new feature or bug fix, create a dedicated branch using a descriptive name, e.g., `git checkout -b feature/add-new-payment-method` or `fix/wallet-balance-bug`.
- 💻 **Implement your changes**: Write clean, well-documented code that adheres to the project's established coding standards.
- 🧪 **Ensure quality**: Include relevant tests for your changes and make sure all existing tests pass.
- ⬆️ **Commit and push**: Write clear, concise, and atomic commit messages. Push your changes to your forked repository.
- 🤝 **Open a Pull Request**: Submit a pull request from your branch to the `main` branch of this repository. Provide a detailed description of your changes and why they are necessary.

## License

This project is licensed under the MIT License.

---

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FF4F00?style=for-the-badge&logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
