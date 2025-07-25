# Keys Directory

This directory will store the private and public keys used for JWT signing and verification.
In a production environment, these keys should be stored securely and not committed to version control.

You can generate a keypair using OpenSSL:

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate public key from private key
openssl rsa -in private.key -pubout -out public.key
```

For development, sample keys will be generated automatically when needed.
