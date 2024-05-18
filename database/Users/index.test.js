// index.test.js
const { readerUserData, insertUserData, updateUserData } = require('./index.js');
const { ConnectionPool } = require('mssql');
const config = require('../config.js');

jest.mock('mssql');
jest.mock('../config.js', () => ({
    connectionString: 'mock-connection-string',
}));

describe('Database operations', () => {
    let mockPool;
    let mockRequest;

    beforeEach(() => {
        mockRequest = {
            query: jest.fn(),
        };

        mockPool = {
            connect: jest.fn(),
            close: jest.fn(),
            request: jest.fn(() => mockRequest),
        };

        ConnectionPool.mockImplementation(() => mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('readerUserData', () => {
        it('should return user data for a valid userID', async () => {
            const mockUserID = 'test@example.com';
            const mockResult = {
                recordset: [{ profile_pic_url: 'http://example.com/pic.jpg', user_type: 'Admin' }],
            };
            mockRequest.query.mockResolvedValue(mockResult);

            const user = await readerUserData(mockUserID);

            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockRequest.query).toHaveBeenCalledWith(`select profile_pic_url, user_type from [User] where email = '${mockUserID}'`);
            expect(mockPool.close).toHaveBeenCalled();
            expect(user).toEqual(mockResult.recordset[0]);
        });

        // it('should handle errors', async () => {
        //     const mockError = new Error('Database error');
        //     mockRequest.query.mockRejectedValue(mockError);

        //     await expect(readerUserData('test@example.com')).rejects.toThrow('Database error');
        //     expect(mockPool.close).toHaveBeenCalled();
        // });
    });

    describe('insertUserData', () => {
        it('should insert user data and return success message', async () => {
            const mockEmail = 'test@example.com';
            const mockProfilePicUrl = 'http://example.com/pic.jpg';
            const mockResult = {
                rowsAffected: [1],
            };
            mockRequest.query.mockResolvedValue(mockResult);

            const response = await insertUserData(mockEmail, mockProfilePicUrl);

            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`INSERT INTO [User] (email, profile_pic_url, user_type, created_at)`));
            expect(mockPool.close).toHaveBeenCalled();
            expect(response).toEqual({ message: 'Success' });
        });

        // it('should handle errors', async () => {
        //     const mockError = new Error('Database error');
        //     mockRequest.query.mockRejectedValue(mockError);

        //     await expect(insertUserData('test@example.com', 'http://example.com/pic.jpg')).rejects.toThrow('Database error');
        //     expect(mockPool.close).toHaveBeenCalled();
        // });
    });

    describe('updateUserData', () => {
        it('should update user data and return success message', async () => {
            const mockEmail = 'test@example.com';
            const mockProfilePicUrl = 'http://example.com/pic.jpg';
            const mockResult = {
                rowsAffected: [1],
            };
            mockRequest.query.mockResolvedValue(mockResult);

            const response = await updateUserData(mockEmail, mockProfilePicUrl);

            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`UPDATE [User] SET profile_pic_url = '${mockProfilePicUrl}'`));
            expect(mockPool.close).toHaveBeenCalled();
            expect(response).toEqual({ message: 'Success' });
        });

        // it('should handle errors', async () => {
        //     const mockError = new Error('Database error');
        //     mockRequest.query.mockRejectedValue(mockError);

        //     await expect(updateUserData('test@example.com', 'http://example.com/pic.jpg')).rejects.toThrow('Database error');
        //     expect(mockPool.close).toHaveBeenCalled();
        // });
    });
});
