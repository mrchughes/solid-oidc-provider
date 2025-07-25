// Mock for oidc-provider module
class Provider {
    constructor(issuer, config) {
        this.issuer = issuer;
        this.config = config;
    }

    async jwks() {
        return {
            keys: [
                {
                    kty: "RSA",
                    use: "sig",
                    kid: "test-key-id",
                    alg: "RS256",
                    n: "somevalue",
                    e: "AQAB"
                }
            ]
        };
    }

    callback() {
        return (req, res, next) => {
            next();
        };
    }
}

module.exports = { Provider };
