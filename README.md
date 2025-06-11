# Web-Crypto-API (Backend for P2P Crypto Exchange)

This project is a backend API for a Peer-to-Peer (C2C) cryptocurrency exchange platform, developed as a take-home coding challenge. It provides a robust and scalable foundation for users to register, trade assets, and manage their funds securely, built with modern tools and industry best practices.

## ✨ Core Features

-   **User & Authentication:** Secure user registration with password hashing (`bcrypt`) and JWT-based authentication (`passport-js`).
-   **Multi-Currency Wallet System:** Each user has wallets for various assets (both crypto and fiat). New users automatically get default fiat wallets (THB, USD) upon registration.
-   **P2P Order System:** Users can create `SELL` and `BUY` orders to be listed on a public marketplace.
-   **Atomic Trade Execution:** The core trading logic is wrapped in a **Database Transaction** (`prisma.$transaction`) to ensure that the exchange of assets between two users is atomic. This guarantees data integrity, meaning a trade either succeeds completely or fails without any partial changes.
-   **Internal Fund Transfers:** Authenticated users can transfer assets directly to other users within the platform. This operation is also fully transactional.
-   **Transaction Logging:** Every successful trade and transfer is recorded in a `TransactionLog` for audit purposes, creating a complete history of financial movements.
-   **Extensible Design:** Includes a placeholder module for future implementation of external withdrawals, demonstrating foresight in system architecture.
-   **API Documentation:** Auto-generated, interactive API documentation using Swagger (OpenAPI).

## 🛠️ Technology Stack

-   **Backend Framework:** **NestJS** (on Node.js) - Chosen for its structured, scalable architecture (Modules, Dependency Injection), which promotes maintainability and testability.
-   **Language:** **TypeScript** - Used for its strong type safety, which is critical in financial applications to prevent common runtime errors.
-   **Database & ORM:** **PostgreSQL** + **Prisma** - PostgreSQL was chosen for its reliability and robust `Decimal` type support. Prisma provides excellent type safety, a clean API, and a powerful migration system.
-   **Authentication:** **Passport.js** (with `passport-jwt` strategy) - The industry standard for handling token-based authentication in the Node.js ecosystem.
-   **Validation:** **`class-validator`** & **`Joi`** - Used for declarative, decorator-based validation of incoming request data (DTOs) and environment variables, ensuring data integrity from the entry point.


## 🚀 Live Demo

**[➡️ View the live application here (if available)](https://youtu.be/5ks-ajdYsJo)**

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
-   [NPM](https://www.npmjs.com/)
-   [Git](https://git-scm.com/)
-   A running PostgreSQL instance

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Thanabodee-Pond/Web-Crypto-API.git](https://github.com/Thanabodee-Pond/Web-Crypto-API.git)
    cd Web-Crypto-API
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root of the project by copying the example file (`.env.example`).
    ```bash
    # On Windows (cmd)
    copy .env.example .env

    # On Linux/macOS
    cp .env.example .env
    ```
    Then, open the newly created `.env` file and fill in your database connection string and a JWT secret.
    ```env
    # .env.example
    DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DATABASE"
    JWT_SECRET="YOUR_SUPER_SECRET_KEY_THAT_NO_ONE_CAN_GUESS"
    ```

4.  **Run Database Migrations:**
    This command will sync the Prisma schema with your database, creating all necessary tables.
    ```bash
    npx prisma migrate dev
    ```

5.  **Seed the Database:**
    This command will populate the database with initial data (assets, test users with pre-funded wallets) for easy testing.
    ```bash
    npx prisma db seed
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run start:dev
    ```
2.  The application will be running on `http://localhost:3000`.

### API Documentation

Once the application is running, you can access the interactive Swagger UI for complete API documentation and testing at:

**`http://localhost:3000/api`**

## Endpoints Overview

Here is a summary of the main API endpoints available:

| Method | Endpoint                    | Protected? | Description                                                 |
| :----- | :-------------------------- | :--------: | :---------------------------------------------------------- |
| `POST` | `/users/register`           |     No     | Register a new user.                                        |
| `POST` | `/auth/login`               |     No     | Log in to receive a JWT access token.                       |
| `GET`  | `/users/me`                 |    Yes     | Get the profile of the currently logged-in user.            |
| `GET`  | `/assets`                   |     No     | Get a list of all supported assets (crypto and fiat).       |
| `GET`  | `/wallets`                  |    Yes     | Get all wallets and balances for the logged-in user.        |
| `GET`  | `/orders`                   |     No     | Get a list of all open orders on the marketplace.           |
| `POST` | `/orders`                   |    Yes     | Create a new buy or sell order.                             |
| `POST` | `/orders/:id/execute`       |    Yes     | Execute someone else's order.                               |
| `POST` | `/transfers`                |    Yes     | Transfer assets to another user within the system.          |
| `POST` | `/withdrawals`              |    Yes     | (Placeholder) Request a withdrawal to an external address.  |
