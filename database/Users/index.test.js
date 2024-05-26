const { ConnectionPool } = require('mssql');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('../../middleware/token.js');
const {
  readerUserData,
  insertUserData,
  blockUser,
  readAllUsers,
  updateUserPfp
} = require('./index.js');

// Mock the necessary modules
jest.mock('mssql');
jest.mock('uuid');
jest.mock('../../middleware/token.js');

const mockConnectionPool = {
  connect: jest.fn(),
  request: jest.fn(() => mockRequest),
  close: jest.fn(),
  connected: true
};

const mockRequest = {
  query: jest.fn()
};

ConnectionPool.mockImplementation(() => mockConnectionPool);
generateToken.mockReturnValue('mock-token');

describe('Data Access Layer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // describe('readerUserData', () => {
  //   let mockPool;
  //   let mockRequest;
  
  //   beforeEach(() => {
  //     mockRequest = {
  //       query: jest.fn()
  //     };
  //     mockPool = {
  //       connect: jest.fn(),
  //       request: jest.fn(() => mockRequest),
  //       close: jest.fn(),
  //       connected: true
  //     };
  //     sql.ConnectionPool.mockImplementation(() => mockPool);
  //     generateToken.mockReturnValue('mock-token');
  //   });
  
  //   afterEach(() => {
  //     jest.clearAllMocks();
  //   });
  
  //   it('should read user data and return it with a token if user exists', async () => {
  //     const mockParams = { id: '350ed8f7-72ac-4ddb-92bc-1e8ef4cf705d', name: 'Armando Abelho' };
  //     mockRequest.query.mockResolvedValueOnce({
  //       recordset: [{ disabled: 0, username: 'testuser', profile_pic: 'url', user_type: 'Applicant' }]
  //     });
  
  //     const result = await readerUserData(mockParams);
  
  //     expect(result).toEqual({
  //       message: 'Success',
  //       disabled: 0,
  //       username: 'testuser',
  //       profile_pic: 'url',
  //       user_type: 'Applicant',
  //       token: 'mock-token'
  //     });
  //     expect(generateToken).toHaveBeenCalledWith({ id: mockParams.id, role: 'Applicant' });
  //   });
  
  //   it('should insert a new user if the user does not exist', async () => {
  //     const mockParams = { id: '123', name: 'newuser' };
  //     mockRequest.query
  //       .mockResolvedValueOnce({ recordset: [] }) // No user found
  //       .mockResolvedValueOnce({ rowsAffected: [1] }); // User inserted
  
  //     const result = await readerUserData(mockParams);
  
  //     expect(result).toEqual({
  //       message: 'Success',
  //       profile_pic: 'https://cdn-icons-png.freepik.com/256/11419/11419168.png?semt=ais_hybrid',
  //       user_type: 'Applicant',
  //       username: 'newuser',
  //       token: 'mock-token'
  //     });
  //     expect(generateToken).toHaveBeenCalledWith({ id: mockParams.id, role: 'Applicant' });
  //   });
  
  //   it('should throw an error if insert fails', async () => {
  //     const mockParams = { id: '123', name: 'newuser' };
  //     mockRequest.query
  //       .mockResolvedValueOnce({ recordset: [] }) // No user found
  //       .mockResolvedValueOnce({ rowsAffected: [0] }); // Insert failed
  
  //     await expect(readerUserData(mockParams)).rejects.toThrow('Failed to insert user');
  //   });
  
  //   it('should handle errors and close the pool', async () => {
  //     const mockParams = { id: '123', name: 'testuser' };
  //     mockRequest.query.mockRejectedValueOnce(new Error('DB error'));
  
  //     await expect(readerUserData(mockParams)).rejects.toThrow('DB error');
  //     expect(mockPool.close).toHaveBeenCalled();
  //   });
  // });

  describe('readAllUsers', () => {
    it('should return all users except admins', async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }]
      });

      const result = await readAllUsers();

      expect(result).toEqual({
        users: [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }],
        message: 'Success'
      });
    });

    it('should return failure message if no users found', async () => {
      mockRequest.query.mockResolvedValueOnce({ recordset: [] });

      const result = await readAllUsers();

      expect(result).toEqual({ message: 'Failure' });
    });

    it('should handle errors and throw them', async () => {
      mockRequest.query.mockRejectedValueOnce(new Error('DB error'));

      await expect(readAllUsers()).rejects.toThrow('DB error');
    });
  });

  // describe('insertUserData', () => {
  //   it('should insert user data and return success message', async () => {
  //     const email = 'test@example.com';
  //     const profile_pic_url = 'http://example.com/pic.jpg';

  //     mockRequest.query.mockResolvedValueOnce({ rowsAffected: [1] });

  //     const result = await insertUserData(email, profile_pic_url);

  //     expect(result).toEqual({ message: 'Success' });
  //   });

  //   it('should return failure message if insert fails', async () => {
  //     const email = 'test@example.com';
  //     const profile_pic_url = 'http://example.com/pic.jpg';

  //     mockRequest.query.mockResolvedValueOnce({ rowsAffected: [0] });

  //     const result = await insertUserData(email, profile_pic_url);

  //     expect(result).toEqual({ message: 'Failure' });
  //   });

  //   it('should handle errors and throw them', async () => {
  //     const email = 'test@example.com';
  //     const profile_pic_url = 'http://example.com/pic.jpg';

  //     mockRequest.query.mockRejectedValueOnce(new Error('DB error'));

  //     await expect(insertUserData(email, profile_pic_url)).rejects.toThrow('DB error');
  //   });
  // });

  describe('updateUserPfp', () => {
    it('should update user profile picture and return success message', async () => {
      const mockObject = { id: '123', profile_pic: 'new-pic-url', username: 'newuser' };

      mockRequest.query.mockResolvedValueOnce({ rowsAffected: [1] });

      const result = await updateUserPfp(mockObject);

      expect(result).toEqual({ message: 'Success' });
    });

    it('should return failure message if update fails', async () => {
      const mockObject = { id: '123', profile_pic: 'new-pic-url', username: 'newuser' };

      mockRequest.query.mockResolvedValueOnce({ rowsAffected: [0] });

      const result = await updateUserPfp(mockObject);

      expect(result).toEqual({ message: 'Failure' });
    });

    it('should handle errors and throw them', async () => {
      const mockObject = { id: '123', profile_pic: 'new-pic-url', username: 'newuser' };

      mockRequest.query.mockRejectedValueOnce(new Error('DB error'));

      await expect(updateUserPfp(mockObject)).rejects.toThrow('DB error');
    });
  });

  describe('blockUser', () => {
    it('should block user and return success message', async () => {
      const mockObject = { id: '123', disabled: true };

      mockRequest.query.mockResolvedValueOnce({ rowsAffected: [1] });

      const result = await blockUser(mockObject);

      expect(result).toEqual({ message: 'Success' });
    });

    it('should return failure message if update fails', async () => {
      const mockObject = { id: '123', disabled: true };

      mockRequest.query.mockResolvedValueOnce({ rowsAffected: [0] });

      const result = await blockUser(mockObject);

      expect(result).toEqual({ message: 'Failure' });
    });

    it('should handle errors and throw them', async () => {
      const mockObject = { id: '123', disabled: true };

      mockRequest.query.mockRejectedValueOnce(new Error('DB error'));

      await expect(blockUser(mockObject)).rejects.toThrow('DB error');
    });
  });
});
