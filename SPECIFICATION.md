# Solid OIDC Provider Specification

## Common Considerations:
- All services MUST support interoperability using Solid OIDC and WebID for user identification.
- Verifiable Credentials MUST be issued in both JSON-LD and Turtle.
- All APIs MUST use HTTPS and standard REST semantics.
- UI components MUST follow GOV.UK Design System (PIP, OIDC) or brand-aligned styles (EON).
- All services MUST support containerized deployment.

## Key Features:
- Solid OIDC-compliant login and registration
- ID tokens include webid claim
- Support PKCE, refresh tokens, and client secrets

## OpenAPI YAML:
```yaml
openapi: 3.0.3
info:
  title: Solid OIDC Provider
  version: 1.0.0
paths:
  /.well-known/openid-configuration:
    get:
      summary: Discover OIDC provider metadata
      responses:
        '200':
          description: Configuration document
  /register:
    post:
      summary: Register new user
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '201':
          description: Registered
  /authorize:
    get:
      summary: Authorize request
      parameters:
        - name: response_type
          in: query
          required: true
          schema:
            type: string
        - name: client_id
          in: query
          required: true
          schema:
            type: string
        - name: redirect_uri
          in: query
          required: true
          schema:
            type: string
        - name: scope
          in: query
          required: true
          schema:
            type: string
      responses:
        '302':
          description: Redirect with code
  /token:
    post:
      summary: Exchange code for token
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
      responses:
        '200':
          description: Token response
  /reset:
    post:
      summary: Send password reset email
  /reset/{token}:
    post:
      summary: Submit new password
  /userinfo:
    get:
      summary: Get user information
      responses:
        '200':
          description: User information including webid, email, and sub
  /jwks.json:
    get:
      summary: Get JSON Web Key Set
      responses:
        '200':
          description: JWKS for token verification
```

## Token Format (example):
```json
{
  "webid": "https://user.example.org/profile/card#me",
  "iss": "https://oidc.gov.uk",
  "aud": "https://pip.gov.uk"
}
```

## Backlog:

### Authentication & Identity:
- Implement Solid OIDC flows: /.well-known, /authorize, /token, /userinfo
- Issue ID tokens with signed webid claim
- Support refresh tokens and revoke endpoint

### User Flows:
- Register/login/logout
- Password reset via tokenised link
- Expiry + lockout policy after 5 failed attempts

### Consent Management:
- Consent screen with app name, logo, scope
- User may persist/deny consent
- Revoke access by client from settings

### UI:
- GOV.UK-style forms for registration, login, password reset
- Session timeout + renewal screen
- View active sessions

### Testing & Deployment:
- Email service mock for reset flow
- JWK endpoint for key rotation
- Docker config with default users

### Non-Functional:
- Response time < 400ms/token request
- Audit logs for login attempts and resets

## Enhancements:
- OpenAPI must include /userinfo endpoint (GET) returning claims including webid, email, and sub.
- Provide /jwks.json endpoint for token verification.
- Include signed JWT example with sample key.

## Token Rotation:
- OIDC provider must allow static or rotating keys with notification to dependent services (e.g., via mount or ENV).

## Session Lifetime:
- Must implement session timeout logic with default 30 minutes idle timeout.
- Provide UI modal to renew session.
