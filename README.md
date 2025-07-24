# Solid OIDC Provider

This repository contains the implementation of the Solid OIDC Provider service for the PDS3.0 project.

## Description

The Solid OIDC Provider implements a W3C Solid-compliant OIDC authentication service. It handles user registration, authentication, and issues tokens with WebID claims for integration with the Solid ecosystem.

## Key Features

- Solid OIDC-compliant login and registration
- ID tokens include webid claim
- Support PKCE, refresh tokens, and client secrets

## Project Structure

```
.
├── docs/              # Documentation and OpenAPI specs
├── scripts/           # Utility scripts for setup and deployment
├── src/               # Source code
├── test/              # Tests
│   └── mocks/         # Mock services for testing
├── README.md          # This file
└── SPECIFICATION.md   # Service specification
```

## Getting Started

### Prerequisites

- Node.js (version TBD)
- Docker and Docker Compose

### Installation

1. Clone this repository
2. Run `npm install`
3. Configure the environment variables

### Running the Service

```bash
npm start
```

Or with Docker:

```bash
docker-compose up
```

## API Documentation

See `docs/openapi.yaml` for the full API specification.

### Postman Collection

This service includes a Postman collection (`solid_oidc_collection.json`) that documents the API endpoints and provides examples. All API changes must be reflected in this collection.

To use the collection:
1. Import it into Postman
2. Set up your environment variables (`base_url`, `webid`, etc.)
3. Run the collection to test your implementation

Refer to the project's [POSTMAN_GUIDE.md](../POSTMAN_GUIDE.md) for detailed instructions on Postman integration and workflows.

## Testing

```bash
npm test
```

## License

TBD
