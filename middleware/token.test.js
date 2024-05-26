const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { generateToken, verifyToken, authenticateToken } = require('./token.js'); // adjust the path as needed

jest.mock('jsonwebtoken');

describe('Authentication Functions', () => {
    const secretKey = uuidv4();
    const mockId = 'user1';
    const mockRole = 'admin';
    const mockPayload = { id: mockId, role: mockRole };
    const mockToken = 'mockToken';

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jwt.sign.mockClear();
        jwt.verify.mockClear();
    });

    describe('generateToken', () => {
        it('should generate a token', () => {
            jwt.sign.mockReturnValue(mockToken);

            const token = generateToken(mockId, mockRole);

            expect(jwt.sign).toHaveBeenCalledWith(mockPayload, expect.any(String), { expiresIn: '1h' });
            expect(token).toBe(mockToken);
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid token', () => {
            jwt.verify.mockReturnValue(mockPayload);

            const result = verifyToken(mockToken);

            expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
            expect(result).toEqual(mockPayload);
        });

        it('should return null for an invalid token', () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const result = verifyToken(mockToken);

            expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
            expect(result).toBeNull();
        });
    });

    describe('authenticateToken middleware', () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                headers: {},
                query: {}
            };
            res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
            next = jest.fn();
        });

        it('should call next if token is valid', () => {
            req.headers['authorization'] = mockToken;
            jwt.verify.mockReturnValue(mockPayload);

            authenticateToken(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.send).not.toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', () => {
            req.headers['authorization'] = mockToken;
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            authenticateToken(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ message: 'Unauthorized' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if token is missing', () => {
            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ message: 'Unauthorized' });
            expect(next).not.toHaveBeenCalled();
        });
    });
});
