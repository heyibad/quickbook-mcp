# QuickBooks Online MCP Server

[![Hacktoberfest 2025](https://img.shields.io/badge/Hacktoberfest-2025-blueviolet)](HACKTOBERFEST.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This is a Model Context Protocol (MCP) server implementation for QuickBooks Online integration.

## 🎃 Hacktoberfest 2025

We're participating in Hacktoberfest 2025! Check out our [Hacktoberfest Guide](HACKTOBERFEST.md) for contribution opportunities. Issues labeled with `hacktoberfest` and `good first issue` are great places to start!

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```env
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_ENVIRONMENT=sandbox

# Optional: Configure CORS (Cross-Origin Resource Sharing)
# Leave empty or omit to allow all origins (use * wildcard)
# ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
```

3. Get your Client ID and Client Secret:
    - Go to the [Intuit Developer Portal](https://developer.intuit.com/)
    - Create a new app or select an existing one
    - Get the Client ID and Client Secret from the app's keys section
    - Add `http://localhost:3000/callback` to the app's Redirect URIs

## Authentication

There are two ways to authenticate with QuickBooks Online:

### Option 1: Using Environment Variables

If you already have a refresh token and realm ID, you can add them directly to your `.env` file:

```env
QUICKBOOKS_REFRESH_TOKEN=your_refresh_token
QUICKBOOKS_REALM_ID=your_realm_id
```

### Option 2: Using the OAuth Flow

If you don't have a refresh token, you can use the built-in OAuth flow:

This will:

- Start a temporary local server
- Open your default browser automatically
- Redirect you to QuickBooks for authentication
- Save the tokens to your `.env` file once authenticated
- Close automatically when complete

## Usage

After authentication is set up, you can use the MCP server to interact with QuickBooks Online. The server provides various tools for managing customers, estimates, bills, and more.

## Available Tools

Added tools for Create, Delete, Get, Search, Update for the following entities:

- Account
- Bill Payment
- Bill
- Customer
- Employee
- Estimate
- Invoice
- Item
- Journal Entry
- Purchase
- Vendor

## Testing

We provide a comprehensive test suite that tests all tools with real QuickBooks data. The test suite:

- Fetches prerequisite data from QuickBooks (customers, vendors, bills, etc.)
- Tests GET, READ, UPDATE, CREATE, and SEARCH operations
- Provides detailed pass/fail/skip reporting
- Measures execution time for each tool

### Running Tests

```bash
# Option 1: Using environment variables
export QUICKBOOKS_ACCESS_TOKEN="your_access_token"
export QUICKBOOKS_REALM_ID="your_realm_id"
npm run test:ts

# Option 2: Using command line arguments
npx ts-node test-all-tools.ts "your_access_token" "your_realm_id"

# Option 3: Build and run
npm run build
npm test "your_access_token" "your_realm_id"
```

For detailed testing documentation, see [TESTING.md](TESTING.md).

## Multi-Tenant Architecture

The server now supports dynamic multi-tenant credential handling:

- Each request passes credentials via headers:
    - `Authorization: Bearer <accessToken>`
    - `X-QuickBooks-RealmId: <realmId>`
- No environment variables needed for credentials
- Different users can access their own QuickBooks companies dynamically
- Perfect for SaaS applications with multiple QuickBooks integrations

### Example: Multi-Tenant Usage

```javascript
// Each request includes both headers
const headers = {
    Authorization: "Bearer eyJhbGciOiJSUzI1Ni...",
    "X-QuickBooks-RealmId": "9341453159261958",
};

// The MCP server extracts credentials from headers automatically
// and routes the request to the correct QuickBooks company
```

## Error Handling

If you see an error message like "QuickBooks not connected", make sure to:

1. Check that your `.env` file contains all required variables
2. Verify that your tokens are valid and not expired
3. For multi-tenant setups, ensure headers are properly set

```

```
