# Solid OIDC Provider

This repository contains the implementation of the Solid OIDC Provider service for the PDS3.0 project.

## Description

The Solid OIDC Provider implements a W3C Solid-compliant OIDC authentication service. It handles user registration, authentication, and issues tokens with WebID claims for integration with the Solid ecosystem.

## Key Features

- **Solid OIDC Compliance**: Fully implements the [Solid-OIDC specification](https://solid.github.io/authentication-panel/solid-oidc/)
- **WebID Support**: Issues tokens with WebID claims and provides WebID profile documents
- **GOV.UK Design System**: All user interfaces follow GOV.UK Design System patterns
- **Security Features**: Account lockout, session timeout, and other security features
- **Two-Factor Authentication**: Optional 2FA support for enhanced security
- **Comprehensive Testing**: Unit tests, integration tests, and Postman collections
- **API Testing**: Comprehensive Postman collection for testing all endpoints
- Support for PKCE, DPoP, refresh tokens, and dynamic client registration

## Project Structure

```
.
├── docs/              # Documentation and OpenAPI specs
├── keys/              # JWT keys for token signing/verification
├── scripts/           # Utility scripts for setup and deployment
├── src/               # Source code
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Express middleware
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── utils/         # Utility functions
├── test/              # Tests
│   ├── integration/   # Integration tests
│   ├── unit/          # Unit tests
│   └── mocks/         # Mock services for testing
├── Dockerfile         # Docker container definition
├── docker-compose.yml # Docker Compose configuration
├── README.md          # This file
└── SPECIFICATION.md   # Service specification
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose (optional)

### Installation

1. Clone this repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and configure the environment variables

```bash
cp .env.example .env
```

### Running the Service

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

Or with Docker:

```bash
docker-compose up
```

### API Endpoints

The Solid OIDC Provider exposes the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/.well-known/openid-configuration` | GET | OIDC discovery document |
| `/register` | POST | Register a new user |
| `/authorize` | GET | OAuth2 authorization endpoint |
| `/token` | POST | OAuth2 token exchange endpoint |
| `/reset-password` | POST | Request password reset |
| `/reset-password?token=<token>` | POST | Reset password with token |
| `/userinfo` | GET | Get user information (requires authentication) |
| `/jwks.json` | GET | Get JSON Web Key Set |
| `/profile/:username` | GET | WebID profile document |
| `/profile/:username/card` | GET | WebID profile card (Turtle format) |

## Solid OIDC Specific Features

- WebID claim in ID and Access tokens
- DPoP (Demonstrating Proof-of-Possession) support
- PKCE (Proof Key for Code Exchange) support
- Dynamic Client Registration
- JWT Response Modes

## API Documentation

See `docs/openapi.yaml` for the full API specification.

### Postman Collection

This service includes two Postman collections:
1. `solid_oidc_collection.json` - Tests basic OIDC Provider functionality
2. `solid_oidc_additional_tests.json` - Tests advanced features including authorization flows with PKCE, refresh tokens, and account management

These collections ensure comprehensive coverage of all must-pass requirements from the specification.

To use the collections:
1. Import them into Postman
2. Set up your environment variables (`base_url`, `webid`, etc.)
3. Run the collections to test your implementation

Refer to the project's [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) for detailed instructions on Postman integration and workflows.

To run all Postman tests via Newman:
```bash
npm run test:postman
```

For a concise test summary:
```bash
npm run test:postman:summary
```

For a comprehensive test plan and coverage matrix, see:
- [docs/test_plan.md](./docs/test_plan.md)

For guidance on creating Postman scripts, see:
- [docs/postman_scripts_overview.md](./docs/postman_scripts_overview.md)
- [docs/postman_testing_implementation.md](./docs/postman_testing_implementation.md)
- [docs/additional_postman_tests.md](./docs/additional_postman_tests.md)

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

For detailed information on test coverage and additional tests, see:
- [TEST_COVERAGE.md](./TEST_COVERAGE.md) - Comprehensive test coverage plan
- [ADDITIONAL_TESTS.md](./ADDITIONAL_TESTS.md) - Guide to running additional tests

## License

TBD
