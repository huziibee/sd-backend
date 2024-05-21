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

        it('should handle errors gracefully', async () => {
            const userID = 'erroruser@example.com';
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(readerUserData(userID)).rejects.toThrow('Database error');
            expect(pool.connect).toHaveBeenCalled();
            expect(pool.close).toHaveBeenCalled();
        });
    });

    describe('readAllUsers', () => {
        it('should return all users', async () => {
            pool.query.mockResolvedValueOnce({ recordset: [{ email: 'user1@example.com' }, { email: 'user2@example.com' }] });

            const result = await readAllUsers();

            expect(pool.connect).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM [User] where disabled = 0;');
            expect(result).toEqual([{ email: 'user1@example.com' }, { email: 'user2@example.com' }]);
        });

        it('should handle errors gracefully', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(readAllUsers()).rejects.toThrow('Database error');
            expect(pool.connect).toHaveBeenCalled();
            expect(pool.close).toHaveBeenCalled();
        });
    });

    describe('insertUserData', () => {
        it('should insert user data and return success message', async () => {
            const email = 'newuser@example.com';
            const profile_pic_url = 'newurl';

            pool.query.mockResolvedValueOnce({ rowsAffected: [1] });

            const result = await insertUserData(email, profile_pic_url);

            expect(pool.connect).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith(`IF NOT EXISTS (SELECT 1 FROM [User] WHERE email = '${email}')
        BEGIN
            INSERT INTO [User] (email, profile_pic_url, user_type, created_at)
            VALUES ('${email}', '${profile_pic_url}', 'Applicant', GETDATE());
        END
        `);
            expect(result).toEqual({ message: 'Success' });
        });

        it('should return failure message if insert fails', async () => {
            const email = 'existinguser@example.com';
            const profile_pic_url = 'existingurl';

            pool.query.mockResolvedValueOnce({ rowsAffected: [0] });

            const result = await insertUserData(email, profile_pic_url);

            expect(pool.connect).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith(`IF NOT EXISTS (SELECT 1 FROM [User] WHERE email = '${email}')
        BEGIN
            INSERT INTO [User] (email, profile_pic_url, user_type, created_at)
            VALUES ('${email}', '${profile_pic_url}', 'Applicant', GETDATE());
        END
        `);
            expect(result).toEqual({ message: 'Failure' });
        });

        it('should handle errors gracefully', async () => {
            const email = 'erroruser@example.com';
            const profile_pic_url = 'errorurl';

            pool.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(insertUserData(email, profile_pic_url)).rejects.toThrow('Database error');
            expect(pool.connect).toHaveBeenCalled();
            expect(pool.close).toHaveBeenCalled();
        });
    });

    describe('updateUserPfp', () => {
        it('should update user profile picture and return success message', async () => {
            const email = 'user@example.com';
            const profile_pic_url = 'newurl';

            pool.query.mockResolvedValueOnce({ rowsAffected: [1] });

            const result = await updateUserPfp(email, profile_pic_url);

            expect(pool.connect).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith(`UPDATE [User] SET profile_pic_url = '${profile_pic_url}' WHERE email = '${email}';`);
            expect(result).toEqual({ message: 'Success' });
        });

        it('should return failure message if update fails', async () => {
            const email = 'user@example.com';
            const profile_pic_url = 'newurl';

            pool.query.mockResolvedValueOnce({ rowsAffected: [0] });

            const result = await updateUserPfp(email, profile_pic_url);

            expect(pool.connect).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith(`UPDATE [User] SET profile_pic_url = '${profile_pic_url}' WHERE email = '${email}';`);
            expect(result).toEqual({ message: 'Failure' });
        });

        it('should handle errors gracefully', async () => {
            const email = 'erroruser@example.com';
            const profile_pic_url = 'errorurl';

            pool.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(updateUserPfp(email, profile_pic_url)).rejects.toThrow('Database error');
            expect(pool.connect).toHaveBeenCalled();
            expect(pool.close).toHaveBeenCalled();
        });
    });

    describe('blockUser', () => {
        it('should block user and return success message', async () => {
            const email = 'user@example.com';

            pool.query.mockResolvedValueOnce({ rowsAffected: [1] });

            const result = await blockUser(email);

            expect(pool.connect).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith(`UPDATE [User] SET disabled = 1 WHERE email = '${email}';`);
            expect(result).toEqual({ message: 'Success' });
        });

        it('should return failure message if update fails', async () => {
            const email = 'user@example.com';

            pool.query.mockResolvedValueOnce({ rowsAffected: [0] });

            const result = await blockUser(email);

            expect(pool.connect).toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledWith(`UPDATE [User] SET disabled = 1 WHERE email = '${email}';`);
            expect(result).toEqual({ message: 'Failure' });
        });

        it('should handle errors gracefully', async () => {
            const email = 'erroruser@example.com';

            pool.query.mockRejectedValueOnce(new Error('Database error'));

            await expect(blockUser(email)).rejects.toThrow('Database error');
            expect(pool.connect).toHaveBeenCalled();
            expect(pool.close).toHaveBeenCalled();
        });
    });
});
