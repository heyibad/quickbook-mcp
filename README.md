# QuickBooks Online MCP Server

This is a Model Context Protocol (MCP) server implementation for QuickBooks Online integration.

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

```

3. Get your Client ID and Client Secret:
    - Go to the [Intuit Developer Portal](https://developer.intuit.com/)
    - Create a new app or select an existing one
    - Get the Client ID and Client Secret from the app's keys section
    - Add `http://localhost:3000/callback` to the app's Redirect URIs

## Authentication
By Passing Cred by in Header if JSON RPC Req.


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



```

```
