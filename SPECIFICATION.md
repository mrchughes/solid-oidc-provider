Solid VC Microservices Prototype Specification

YOU ARE REQUIRED TO BUILD THE SOLID-OIDC-SERVICE - YOU MUST NOT ATTEMPT TO BUILD ANY OTHER SERVICES

📄 Prototype Context Summary for Suppliers
This specification defines a prototype Verifiable Credential (VC) system implemented as a set of containerized microservices. It is not for production, and the goal is to demonstrate working interoperability between Solid Personal Data Stores (PDS), OIDC-based authentication, and linked data-based credential issuance and consumption.
✳️ Key Design Principles
Citizens are identified via WebID (RDF-based URIs).
Services are identified using DID:web, and issue credentials signed with these DIDs.
All services must support containerized deployment and expose RESTful APIs using OpenAPI specs.
Services must use existing open-source libraries and frameworks where possible.
🧱 Core Functional Components
A Solid-compliant PDS using RDF/Turtle for all storage, built on the Community Solid Server (CSS).
A Solid OIDC provider for user registration and authentication, following GOV.UK design patterns.
A PIP-branded credential service that authenticates via Solid OIDC and issues mock benefit award VCs to the user’s pod, with a user interface styled to GOV.UK standards.
An EON-branded credential consumer and issuer that uses local JWT auth for its UI, but authenticates via Solid OIDC to interact with user pods. It consumes the PIP VC, determines eligibility, and issues an EON discount VC.
🔄 Interoperability and Format Expectations
All Verifiable Credentials must be available in both Turtle and JSON-LD.
The PDS backend must use Turtle natively, and services must negotiate preferred VC formats where applicable.
All APIs must use HTTPS and include properly scoped access tokens containing the WebID claim.
📋 Supplier Delivery Requirements
Each service has a fully scoped specification including:
✅ API definitions (OpenAPI YAML)
✅ Token format examples
✅ Complete backlog of user-visible and technical features
✅ Explicit UX expectations (e.g. login, reset password, issue/consume VCs, consent management)
✅ GOV.UK or brand-aligned styling
✅ Configurable test data, mock authentication, and test environment readiness
Monitoring, alerting, and hardened security are not in scope for this prototype.
Each service spec is self-contained and may be delivered independently under fixed-price contract terms.
This document must not be edited by supplier
Services must have fully complete code, not scaffolding, to-dos or placeholders.
Supplier must maintain a single backlog with items and status available at any time for inspection.
Repositories must be clean, tidy and organised, docs in a docs folder, scripts in a script folder etc.
Supplier must maintain a single readme in root repo with basic rules for teams including those above.
Supplier must not deviate from this specification.


1. Solid Personal Data Store (PDS)
Common Considerations:
All services MUST support interoperability using Solid OIDC and WebID for user identification.
Verifiable Credentials MUST be issued in both JSON-LD and Turtle.
All APIs MUST use HTTPS and standard REST semantics.
UI components MUST follow GOV.UK Design System (PIP, OIDC) or brand-aligned styles (EON).
All services MUST support containerized deployment.
Key Features:
RDF-native storage (Turtle preferred)
Solid-compliant Pod and WebID per user
Credential storage under /credentials/
Access control via WAC/ACP
OpenAPI YAML:
openapi: 3.0.3
info:
 title: Solid PDS
 version: 1.0.0
paths:
 /profile/card:
   get:
     summary: Get WebID Profile
     responses:
       '200':
         description: WebID profile in Turtle
   put:
     summary: Update WebID Profile
     requestBody:
       content:
         text/turtle:
           schema:
             type: string
     responses:
       '200':
         description: Updated
 /credentials/{vcId}:
   get:
     summary: Read credential
     parameters:
       - name: vcId
         in: path
         required: true
         schema:
           type: string
     responses:
       '200':
         description: VC as Turtle or JSON-LD
   put:
     summary: Write credential
     parameters:
       - name: vcId
         in: path
         required: true
         schema:
           type: string
     requestBody:
       content:
         text/turtle:
           schema:
             type: string
         application/ld+json:
           schema:
             type: object
     responses:
       '201':
         description: Stored
   delete:
     summary: Delete credential
     parameters:
       - name: vcId
         in: path
         required: true
         schema:
           type: string
     responses:
       '204':
         description: Deleted
 /.acl:
   put:
     summary: Set access permissions
     requestBody:
       content:
         text/turtle:
           schema:
             type: string
     responses:
       '200':
         description: Access rules updated
Token Format (example):
{
 "webid": "https://user.example.org/profile/card#me",
 "iss": "https://solid-oidc.gov.uk",
 "aud": "https://pds.example.org"
}

Backlog:
Authentication & Identity:
Implement Solid OIDC token validation for all user actions
Support user profile discovery via WebID document
Credential Operations:
Store credentials under /credentials/{vcId} path
Support GET/PUT/DELETE VC operations in both Turtle and JSON-LD
Generate metadata for discoverability (e.g. via ldp:contains, RDF type triples)
Allow user to label VCs and attach tags
Access Control & Consent:
Implement WAC and ACP-based access rules per VC
Allow user to grant/revoke access to third parties with expiration
Log all access events to support auditing
User Interface:
View and edit WebID profile
List VCs with filter/search/sort
View VC in raw (Turtle, JSON-LD) and friendly format
Consent screen: approve/reject third-party VC access requests
View access history and revoke permissions
Testing & Deployment:
Docker container with volume-backed storage
Enable reset user data mode for testing
Environment config: domain, port, data root
Non-Functional:
Conform to GOV.UK design system for UI
Fast response < 500ms for GET profile/VC
Load test with 1000 concurrent VC reads




2. Solid OIDC Provider
Common Considerations:
All services MUST support interoperability using Solid OIDC and WebID for user identification.
Verifiable Credentials MUST be issued in both JSON-LD and Turtle.
All APIs MUST use HTTPS and standard REST semantics.
UI components MUST follow GOV.UK Design System (PIP, OIDC) or brand-aligned styles (EON).
All services MUST support containerized deployment.
Key Features:
Solid OIDC-compliant login and registration
ID tokens include webid claim
Support PKCE, refresh tokens, and client secrets
OpenAPI YAML:
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
Token Format (example):
{
 "webid": "https://user.example.org/profile/card#me",
 "iss": "https://oidc.gov.uk",
 "aud": "https://pip.gov.uk"
}
Backlog:
Authentication & Identity:
Implement Solid OIDC flows: /.well-known, /authorize, /token, /userinfo
Issue ID tokens with signed webid claim
Support refresh tokens and revoke endpoint
User Flows:
Register/login/logout
Password reset via tokenised link
Expiry + lockout policy after 5 failed attempts
Consent Management:
Consent screen with app name, logo, scope
User may persist/deny consent
Revoke access by client from settings
UI:
GOV.UK-style forms for registration, login, password reset
Session timeout + renewal screen
View active sessions
Testing & Deployment:
Email service mock for reset flow
JWK endpoint for key rotation
Docker config with default users
Non-Functional:
Response time < 400ms/token request
Audit logs for login attempts and resets

3. PIP VC Service
Common Considerations:
All services MUST support interoperability using Solid OIDC and WebID for user identification.
Verifiable Credentials MUST be issued in both JSON-LD and Turtle.
All APIs MUST use HTTPS and standard REST semantics.
UI components MUST follow GOV.UK Design System (PIP, OIDC) or brand-aligned styles (EON).
All services MUST support containerized deployment.
Key Features:
Log in via Solid OIDC
Generate and sign benefit award VCs
Push to Solid pod with EON access pre-granted
OpenAPI YAML:
openapi: 3.0.3
info:
 title: PIP VC Service
 version: 1.0.0
paths:
 /login:
   post:
     summary: Authenticate using Solid OIDC
 /eligibility:
   get:
     summary: Get PIP award mock data
 /vc/preview:
   get:
     summary: Preview VC before issuing
 /vc/issue:
   post:
     summary: Issue VC to user pod
 /vc/list:
   get:
     summary: List issued VCs
 /vc/revoke:
   post:
     summary: Revoke credential
Token Format (example):
{
 "webid": "https://user.example.org/profile/card#me",
 "iss": "https://oidc.gov.uk"
}
Backlog:
Authentication:
OIDC login and session validation
Extract WebID from token and store locally
VC Generation:
Construct VC for PIP benefit
Include benefit type, weekly amount, issuing body
Format in both Turtle + JSON-LD
Sign using fixed DID:web and public key
Pod Storage:
Discover Pod URL via WebID
PUT VC into /credentials/
Assign readable label, tag, and grant EON access
UI:
Login with Solid
View mock PIP benefit details
Preview and issue credential
List all issued credentials
Revoke with reason dialog
Testing & Deployment:
Configurable mock data
VC JSON schema validator
GOV.UK design + container config
Non-Functional:
VC issuance within 500ms
Complete VC lifecycle log

4. EON VC Service
Common Considerations:
All services MUST support interoperability using Solid OIDC and WebID for user identification.
Verifiable Credentials MUST be issued in both JSON-LD and Turtle.
All APIs MUST use HTTPS and standard REST semantics.
UI components MUST follow GOV.UK Design System (PIP, OIDC) or brand-aligned styles (EON).
All services MUST support containerized deployment.
Key Features:
Local JWT login
Use Solid OIDC for pod access
Fetch PIP VC and generate discount decision
OpenAPI YAML:
openapi: 3.0.3
info:
 title: EON VC Service
 version: 1.0.0
paths:
 /auth:
   post:
     summary: JWT login
 /pip-vc:
   get:
     summary: Load PIP VC from pod
 /discount-decision:
   get:
     summary: Run rules against PIP VC
 /vc/issue:
   post:
     summary: Issue discount VC
 /vc/view:
   get:
     summary: View EON-issued VCs
Token Format (example):
{
 "webid": "https://user.example.org/profile/card#me",
 "sub": "user123@eon.co.uk"
}
Backlog:
Auth:
JWT login for users
Fetch Solid access token for pod interaction
Validate token scopes
VC Consumption:
Discover and fetch PIP VC in Turtle or JSON-LD
Parse RDF, extract benefit value
Apply threshold logic and compute result
Discount VC Issuance:
Construct new VC with discount details
Sign using EON DID:web
Write to Pod with public read access
UI:
JWT login form
PIP VC view with parsed summary
Decision explanation + eligibility verdict
Confirmation of VC storage
Testing & Deployment:
Mock user store
Configurable rule threshold
Dockerized + logging for all flows
Non-Functional:
Load time < 1s for complete flow
WCAG 2.1 compliant UI
✅ E2E Test Scenario 1: Register & Issue PIP VC
Objective: Verify a citizen can register, authenticate, and receive a benefit credential written to their Solid pod.
Steps:
User registers via Solid OIDC Provider (GOV.UK-styled UI).
User logs in to PIP VC Service using Solid OIDC.
PIP Service retrieves WebID and mocks PIP benefit data.
User previews the VC (in both JSON-LD and Turtle).
User confirms issuance, and the PIP Service:
Generates and signs the VC using did:web:pip.gov.uk
Stores the VC in the user’s Pod under /credentials/
User logs into Solid PDS UI:
Views the VC in raw RDF and formatted mode
Verifies the VC is accessible via their WebID
Expected Results:
Credential is correctly linked to user WebID.
VC is stored in Turtle and can be retrieved via authenticated GET.
Solid Pod lists the VC in /credentials/.

✅ E2E Test Scenario 2: EON Consumes PIP VC and Issues Discount VC
Objective: Verify EON can authenticate, consume a benefit VC, and issue a discount credential to the user’s pod.
Steps:
User logs into EON UI using EON local JWT auth.
EON backend uses Solid OIDC to:
Obtain WebID-based access token
Read VC from the user’s /credentials/ in the Pod
EON parses the PIP benefit amount from Turtle or JSON-LD.
EON applies business logic:
If amount > £80/week, user qualifies for discount.
User consents to issue a VC.
EON issues a DiscountEligibilityCredential, signs with did:web:eon.co.uk, and writes it to the Pod.
Expected Results:
PIP VC is parsed correctly from Pod.
Eligibility decision is accurate based on amount.
EON VC is written to the Pod and marked for public read or limited access.

✅ E2E Test Scenario 3: Citizen Views and Manages All Credentials
Objective: Verify a citizen can inspect, manage, and revoke access to issued VCs from the Solid Pod UI.
Steps:
User logs into the Solid PDS UI via Solid OIDC.
UI lists:
PIP VC with details and signature info
EON VC with discount reason and value
User:
Views VC in both formats
Revokes EON’s access to their Pod
EON attempts to read the credential again.
Expected Results:
Both VCs are viewable and properly formatted.
Revoking EON access removes ability to fetch VC.
Access control changes are reflected in Pod metadata (e.g. WAC/ACP rules).
✅ Common Credential Envelope (JSON-LD and Turtle)
Each VC MUST conform to the W3C Verifiable Credentials Data Model and include the following properties:
JSON-LD Example:
{
 "@context": [
   "https://www.w3.org/2018/credentials/v1",
   "https://schema.org/"
 ],
 "id": "urn:uuid:{uuid}",
 "type": ["VerifiableCredential", "{CustomType}"],
 "issuer": "https://{issuer-domain}/did.json",
 "issuanceDate": "2025-07-24T12:00:00Z",
 "credentialSubject": {
   "id": "{WebID}",
   "benefitType": "PIP",
   "amount": "£90.10/week"
 },
 "proof": {
   "type": "RsaSignature2018",
   "created": "2025-07-24T12:00:00Z",
   "proofPurpose": "assertionMethod",
   "verificationMethod": "https://{issuer-domain}/keys/123#pub",
   "jws": "..."
 }
}
Turtle Example:
@prefix cred: <https://www.w3.org/2018/credentials#> .
@prefix schema: <http://schema.org/> .

<urn:uuid:benefit-award-vc-123>
 a cred:VerifiableCredential ;
 cred:issuer <https://pip.gov.uk/did.json> ;
 cred:credentialSubject <https://user.example.org/profile/card#me> ;
 cred:issuanceDate "2025-07-24T12:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
 cred:proof [
   a cred:Proof ;
   cred:created "2025-07-24T12:00:00Z" ;
   cred:type "RsaSignature2018" ;
   cred:proofPurpose "assertionMethod" ;
   cred:verificationMethod <https://pip.gov.uk/keys/123#pub> ;
   cred:jws "..."
 ] ;
 schema:benefitType "PIP" ;
 schema:amount "£90.10/week" .

🔐 Access Token Claims (OIDC & Local Auth)
Solid OIDC Token (used by PIP, PDS, EON for Pod access):
{
 "webid": "https://user.example.org/profile/card#me",
 "iss": "https://oidc.solid.gov.uk",
 "sub": "user-abc",
 "aud": "https://pds.solid.example.org",
 "scope": "openid profile webid",
 "exp": 1722000000
}
Local JWT (EON UI Authentication only):
{
 "sub": "user123@eon.co.uk",
 "email": "user123@eon.co.uk",
 "role": "citizen",
 "exp": 1722000000
}
EON will use Solid OIDC to interact with user Pods, and its local JWT is only used for UI login.

📑 Credential Type Mapping Per Service
 
All 

ervices consuming VCs must:
Support Turtle parsing
Be able to interpret VC subject ID = WebID
Support issuer, proof, and credentialSubject standard fields
🔍 Must-Pass Postman Test Collection: Summary per Service
✅ Solid OIDC Provider
POST /register – register new user, assert 201 and ID returned
POST /login – assert token response includes valid webid
POST /reset-password – assert token flow triggers and validates
GET /userinfo – check returned user profile has correct fields
✅ Solid PDS
GET /profile/card – return valid RDF WebID document
PUT /credentials/{id} – store credential in both Turtle and JSON-LD
GET /credentials/{id} – assert credential content and format
DELETE /credentials/{id} – confirm VC deletion
PUT /.acl – test access grant to another WebID
✅ PIP VC Service
GET /benefit-preview – mock benefit claim response
POST /vc/issue – assert VC returned contains correct WebID and proof
POST /vc/publish – confirm VC write success to Solid Pod
GET /vc/history – list of VCs previously issued to user
✅ EON VC Service
POST /login – local JWT returned
POST /token/solid – get Solid OIDC token using refresh
GET /vc/fetch – retrieve VC from Solid Pod, assert WebID and type
POST /vc/decision – check discount logic result
POST /vc/issue – issue EON VC and assert content
POST /vc/publish – store new VC to Pod and confirm accessibility
All tests must assert:
Correct HTTP response code
Response body includes required VC fields
Content type (e.g., application/ld+json, text/turtle)
Proof signature block exists (in stub or mock form)
Postman environments should include:
base_url
webid
access_token
vc_example_jsonld
vc_example_turtle
📦 Stub Dependencies and Test Mocks (Supplier Responsibility)
To support parallel development and ensure inter-service interoperability, each supplier must independently implement stubbed versions of any external service dependencies based on the provided OpenAPI specifications and VC interoperability appendix.
✅ Requirement
Each supplier MUST:
Build local mock implementations (stubs) for all upstream services their solution depends on
Use these mocks to support automated testing, development, and Postman collection execution
Validate that all interactions (requests/responses) match the documented API contracts
Include a script or container to run these mocks locally for internal and cross-team testing
🔄 Example Expectations

🧩 Shared Inputs
All teams MUST ensure their mocks and real services:
Accept the credential shapes as defined in the VC Interop Appendix
Accept the token formats defined in token claim examples
Are testable using the shared must-pass Postman collection
📁 Recommended Format
Each service’s delivery should include a /test/mocks/ directory containing:
README.md with how to run the mocks
Lightweight HTTP stubs (Node/Express, Flask, etc.)
Static credential examples (Turtle and JSON-LD)
Pre-signed access tokens and example WebID documents
🔍 GENERAL CLARIFICATIONS (ADDED)
Terminology Consistency:
All endpoint and property names across OpenAPI specs must use consistent naming conventions.
For example, clarify use of /vc/publish vs /vc/issue to prevent supplier misalignment.
Pod Discovery:
Define pod discovery logic when storage triple is not found in a WebID profile.
Recommend fallback to: https://{webid-domain}/storage/ unless explicitly overridden.
OIDC Tokens:
Token expiration and refresh handling must be scoped.
Minimum token lifetime: 15 minutes.
Expired tokens must return HTTP 401.
Token Examples:
All services must include stub examples for access tokens, including signature blocks (even mock).
OIDC providers must expose /.well-known/jwks.json endpoint.

1. Solid Personal Data Store (PDS)
Enhancements:
Include ldp:contains triples in the pod to support credential discovery.
Suggest supporting index document under /credentials/index.ttl listing all VC resources.
Clarify .acl inheritance: ACLs apply per-resource; use container ACLs to apply to all contents.
Added Requirement:
VC files must include standard RDF metadata including:
rdf:type, dc:created, dc:modified, dc:title, dc:creator

2. Solid OIDC Provider
Enhancements:
OpenAPI must include /userinfo endpoint (GET) returning claims including webid, email, and sub.
Provide /jwks.json endpoint for token verification.
Include signed JWT example with sample key.
Token Rotation:
OIDC provider must allow static or rotating keys with notification to dependent services (e.g., via mount or ENV).
Session Lifetime:
Must implement session timeout logic with default 30 minutes idle timeout.
Provide UI modal to renew session.

3. PIP VC Service
Clarifications:
Ensure /vc/publish and /vc/issue are either synonymous or clearly separated (e.g., issue signs, publish writes).
VC schema (PIPBenefitCredential) must be included in /docs/schemas/ in both JSON Schema and RDF shapes.
Credential Metadata:
All issued VCs must include labels, tags, and metadata (see PDS additions above).
VC must be signed with static DID:web, and public key reference must be published.

4. EON VC Service
Clarifications:
VC selection from Pod should support selection by type or issued date.
Rule thresholds (e.g. £80/week) must be externally configurable (e.g. ENV or JSON config).
Resulting DiscountEligibilityCredential must include:
VC subject ID = user WebID
Issuer = did:web:eon.co.uk
RDF metadata and digital proof

5. UI & Repo Structure
UI:
All UI screens must follow GOV.UK or brand-consistent design.
Accessibility: All pages must meet WCAG 2.1 AA.
Repository Layout:
/README.md                # high-level usage + team rules
/docs/                    # OpenAPI, schemas, architecture
/scripts/                 # install, test, run helpers
/test/mocks/              # mock dependencies, example tokens, VC examples
/src/                     # service code
Config Files:
.env.example must be included to show default runtime config.
Docker image names must follow: org/service-name[:tag].

6. Testing & Mocks
Updated Expectation:
Shared Postman suite is NOT required for this prototype.
Each service must:
Include working mocks for dependent services
Include at least 2 real test VCs (Turtle + JSON-LD)
Provide example requests/responses for each endpoint
Mock Examples:
/test/mocks/
├── README.md
├── tokens/
│   └── oidc_token.json
├── vcs/
│   ├── pip_vc.jsonld
│   └── pip_vc.ttl
└── services/
    ├── mock-pds.py
    └── mock-solid-idp.py

7. Delivery Rules (Updated)
Each service must:
Deliver complete and runnable code (no placeholders or TODOs)
Use mock data and Docker configs that work in local environment only
Include internal test coverage (unit + integration)
Not in Scope:
Robust security
Monitoring or alerting
External cloud deployment