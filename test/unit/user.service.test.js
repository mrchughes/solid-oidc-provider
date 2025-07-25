const userService = require('../../src/services/user');

describe('User Service', () => {
    beforeEach(() => {
        // Clear any users created during tests
        // This would normally be done by clearing a test database
        jest.resetModules();
    });

    describe('createUser', () => {
        it('should create a new user', () => {
            const email = 'test@example.com';
            const password = 'hashedpassword123';

            const user = userService.createUser(email, password);

            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('email', email);
            expect(user).toHaveProperty('password', password);
            expect(user).toHaveProperty('webid');
        });

        it('should throw an error if user already exists', () => {
            const email = 'duplicate@example.com';
            const password = 'hashedpassword123';

            userService.createUser(email, password);

            expect(() => {
                userService.createUser(email, password);
            }).toThrow('User already exists');
        });
    });

    describe('findUserByEmail', () => {
        it('should find a user by email', () => {
            const email = 'find@example.com';
            const password = 'hashedpassword123';

            const createdUser = userService.createUser(email, password);
            const foundUser = userService.findUserByEmail(email);

            expect(foundUser).toEqual(createdUser);
        });

        it('should return null if user not found', () => {
            const foundUser = userService.findUserByEmail('notfound@example.com');

            expect(foundUser).toBeNull();
        });
    });

    // Additional tests for other user service functions
});
