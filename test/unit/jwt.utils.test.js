const jwt = require('../../src/utils/jwt');
const fs = require('fs');
const path = require('path');

// Mock fs module
jest.mock('fs', () => ({
    readFileSync: jest.fn(),
}));

describe('JWT Utils', () => {
    beforeEach(() => {
        // Reset mock implementation
        fs.readFileSync.mockReset();

        // Mock private key
        fs.readFileSync.mockReturnValueOnce(`-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAw6KF5wHQVr39sN/YG9JVvKj4BxGcnUzBJcJKK+z/wLcOzvcV
FpZ5NfTWJdnh3GDiJ1xy9UACOLVgkX4+jgJ14jwguwBJ63DNGIYvh+TLhmIVU3F2
q5JiOXIDRLwYJiIGwpKzGw4viVxbTgVnm+qZ/Tsb+ZH+BJYK9m6IrH7clHuKrUMo
7TY+vX4jl5G5Saz9Fl0D1YDpS04XVcvowT6HKZrH07jbp8qrMEA1M9J8TmM1v5sZ
v8JZbEj7+6SUhfVxP5uPMqoeIrA0a0oIQMf3GzINGUIOAE0I8NuTqrYcnFM9TVbj
tW9DpNUYDXEWWLVf1Ue94VwJYN3vUZwWnDlI2QIDAQABAoIBAQCsU4DvUP1JrIhx
9L3+c0+PH+IqXpf1e4IQT3sgA2vUihJcBZ7QseB9VmtOoFQBKY54HsC9wXyKjcMB
BKEFx9PrZXn5XiHZIo5Dmg8QlneNfkfW1FwbQ/YbPV5QcS8HgzBQC5J/qBTEqFcn
g3OtPZm0EyPxFdoiOdYyPj5mMH8jCJ23vLp3wJwXDIBVYoECgYEA+q5oGSC+kHHJ
HkKmgiXkOouGLuKWu956lDKWWO+X0Y9qTHKM3IlUKNRR6xmP3wMjz2TQGnxpx2ik
p5rl1WCBnzrn9tJ5mA+eiylUWNM8sj5SAy09C4PyoyQgqJQJUyqUNPbdJiHaVs9H
8hmYZwA8wLFY0QEm8F1KMeHfHmUCgYEAx+YWxm1AE8L4Wd8BKCFl9yUErWFQEPed
6z8n2Iz8tfITjt/wNdAR79YntWRTmK1yiXq4NOGhmNfZ2xkxUsQuCQ5yyT37eYQE
xd8QUwZZi6FnJ0WZnOBJ9qdHaYZrJOzGPanlm9CBW3xY1vLH6jYCF/B5knWEnNs7
VGkO/OVBApUCgYEAlDX7JbHJHbjDFqLVEA1LXjiLNsKZxS5mZhdgO9ESSgjnKQkL
FZW7lNABVj6Z5ngrcDY8HdWRDMpAHPWJxMVj5KBuLbrytA+bzpR9Gj91RnFzLJtJ
8xc5H8b8JUzZDlJuUZZbNZz9X/Ga1Bj7dipEXpM9YKS7lsKCYYCJQZJqw1kCgYAq
mQ1YjX/hcYIJmVnxiHA1iKULXhtFn/6ZRc2QpIK5JeYLjiYZwYQvpOYAlLuZQXvH
aWGGxgVaYgfNFR3XyOJo3PGiGLHYGhP1MJb72Kv4BEzQZCPXF4r+m5yzVMcY2OZw
XaGBfDrK8K/G8zBVo7QgPA5OIpBQNUPNf2RpZrNkIQKBgQDXxVH8Q9Lh25bYkIW+
v8QMFQynQQXIVWSIyCwf8P9jqNPzAQD0KPumkL9Vx/4TBXOmaKaiYwyWTP+n0e3L
ZXtzOIl8vKrJe0RcKJTn3x0X0jUdIyh+bXGa568fK96S4gVuHqXmZQvooZhqj4XQ
aYyf+wYUFMQYMPqCHweOU4prQw==
-----END RSA PRIVATE KEY-----`);

        // Mock public key
        fs.readFileSync.mockReturnValueOnce(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw6KF5wHQVr39sN/YG9JV
vKj4BxGcnUzBJcJKK+z/wLcOzvcVFpZ5NfTWJdnh3GDiJ1xy9UACOLVgkX4+jgJ1
4jwguwBJ63DNGIYvh+TLhmIVU3F2q5JiOXIDRLwYJiIGwpKzGw4viVxbTgVnm+qZ
/Tsb+ZH+BJYK9m6IrH7clHuKrUMo7TY+vX4jl5G5Saz9Fl0D1YDpS04XVcvowT6H
KZrH07jbp8qrMEA1M9J8TmM1v5sZv8JZbEj7+6SUhfVxP5uPMqoeIrA0a0oIQMf3
GzINGUIOAE0I8NuTqrYcnFM9TVbjtW9DpNUYDXEWWLVf1Ue94VwJYN3vUZwWnDlI
2QIDAQAB
-----END PUBLIC KEY-----`);
    });

    describe('generateToken', () => {
        it('should generate a valid JWT token', async () => {
            const payload = {
                sub: 'test-user',
                webid: 'https://example.com/profile/test-user#me'
            };

            const token = await jwt.generateToken(payload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3); // Header, payload, signature
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid token', async () => {
            const payload = {
                sub: 'test-user',
                webid: 'https://example.com/profile/test-user#me',
                exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
            };

            const token = await jwt.generateToken(payload);
            const decoded = await jwt.verifyToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.sub).toBe(payload.sub);
            expect(decoded.webid).toBe(payload.webid);
        });

        it('should reject an expired token', async () => {
            const payload = {
                sub: 'test-user',
                webid: 'https://example.com/profile/test-user#me',
                exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago (expired)
            };

            const token = await jwt.generateToken(payload);

            await expect(jwt.verifyToken(token)).rejects.toThrow();
        });

        it('should reject a token with invalid signature', async () => {
            const validToken = await jwt.generateToken({ sub: 'test-user' });
            const parts = validToken.split('.');

            // Change the signature part
            const invalidToken = `${parts[0]}.${parts[1]}.invalidSignature`;

            await expect(jwt.verifyToken(invalidToken)).rejects.toThrow();
        });
    });

    describe('decodeToken', () => {
        it('should decode a token without verification', () => {
            const payload = {
                sub: 'test-user',
                webid: 'https://example.com/profile/test-user#me'
            };

            const token = jwt.generateToken(payload);
            const decoded = jwt.decodeToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.sub).toBe(payload.sub);
            expect(decoded.webid).toBe(payload.webid);
        });

        it('should decode even an invalid token', () => {
            const validToken = jwt.generateToken({ sub: 'test-user' });
            const parts = validToken.split('.');

            // Change the signature part
            const invalidToken = `${parts[0]}.${parts[1]}.invalidSignature`;
            const decoded = jwt.decodeToken(invalidToken);

            expect(decoded).toBeDefined();
            expect(decoded.sub).toBe('test-user');
        });
    });
});
