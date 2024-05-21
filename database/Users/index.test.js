const { ConnectionPool } = require('mssql');
const {
    readerUserData,
    insertUserData,
    blockUser,
    readAllUsers,
    updateUserPfp
} = require('./index.js');

jest.mock('mssql');

describe('Database functions', () => {
    let pool;

    beforeEach(() => {
        pool = {
            connect: jest.fn(),
            close: jest.fn(),
            request: jest.fn().mockReturnThis(),
            query: jest.fn()
        };
        ConnectionPool.mockImplementation(() => pool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('readerUserData', () => {
        it('should return user data if user exists', async () => {
            const userID = 'test@example.com';
            pool.query.mockResolvedValueOnce({ recordset: [{ profile_pic_url: 'url', user_type: 'type', name: 'name' }] });

            const result = await readerUserData(userID);

            expect(pool.connect).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith(`SELECT profile_pic_url, user_type, name FROM [User] WHERE email = '${userID}'`);
            expect(result).toEqual({ profile_pic_url: 'url', user_type: 'type', name: 'name', message: 'Success' });
        });

        it('should insert user and return user data if user does not exist', async () => {
            const userID = 'newuser@example.com';
            pool.query.mockResolvedValueOnce({ recordset: [] });
            pool.query.mockResolvedValueOnce({ rowsAffected: [1] });

            const result = await readerUserData(userID);

            expect(pool.connect).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith(`SELECT profile_pic_url, user_type, name FROM [User] WHERE email = '${userID}'`);
            expect(pool.query).toHaveBeenCalledWith(`INSERT INTO [User] (email, profile_pic_url, user_type, created_at, disabled) VALUES ('${userID}', 'https://cdn-icons-png.freepik.com/256/11419/11419168.png?semt=ais_hybrid', 'Applicant', GETDATE(), 0);`);
            expect(result).toEqual({
                message: 'Success',
                profile_pic_url: 'https://cdn-icons-png.freepik.com/256/11419/11419168.png?semt=ais_hybrid',
                user_type: 'Applicant'
            });
        });

        it('should handle errors', async () => {
            const mockError = new Error('Database error');
            mockRequest.query.mockRejectedValue(mockError);

            await expect(readerUserData('test@example.com')).rejects.toThrow('Database error');
            expect(mockPool.close).toHaveBeenCalled();
        });
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

        it('should handle errors', async () => {
            const mockError = new Error('Database error');
            mockRequest.query.mockRejectedValue(mockError);

            await expect(insertUserData('test@example.com', 'http://example.com/pic.jpg')).rejects.toThrow('Database error');
            expect(mockPool.close).toHaveBeenCalled();
        });
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

        it('should handle errors', async () => {
            const mockError = new Error('Database error');
            mockRequest.query.mockRejectedValue(mockError);

            await expect(updateUserData('test@example.com', 'http://example.com/pic.jpg')).rejects.toThrow('Database error');
            expect(mockPool.close).toHaveBeenCalled();
        });
    });
});
