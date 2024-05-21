const { ConnectionPool } = require('mssql');
const {
    insertFundingApp,
    readFundApps,
    updateFundingApp,
} = require('./fundApps.js'); // Replace 'yourFileName.js' with the actual file name

jest.mock('mssql');
jest.mock('./config', () => ({
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

    describe('readFundApps', () => {
        it('should return fund applications', async () => {
            const mockResult = {
                recordset: [{ id: 1, applicant_email: 'test@example.com', evaluated: 0 }],
            };
            mockRequest.query.mockResolvedValue(mockResult);

            const applications = await readFundApps();

            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`select * from [fundersApps] where evaluated = 0;`));
            expect(mockPool.close).toHaveBeenCalled();
            expect(applications).toEqual(mockResult.recordset);
        });

        it('should handle errors', async () => {
            const mockError = new Error('Database error');
            mockRequest.query.mockRejectedValue(mockError);

            await expect(readFundApps()).rejects.toThrow('Database error');
  //          expect(mockPool.connect).toHaveBeenCalled();
   //         expect(mockPool.close).toHaveBeenCalled();
        });
    });

    describe('insertFundingApp', () => {
        it('should insert a funding application and return success message', async () => {
            const mockApplication = {
                email: 'test@example.com',
                justification: 'Justification text',
            };
            const mockResult = {
                rowsAffected: [1],
            };
            mockRequest.query.mockResolvedValue(mockResult);

            const response = await insertFundingApp(mockApplication);

            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`INSERT INTO fundersApps (applicant_email, justification)`));
            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
            expect(response).toEqual({ message: 'Success' });
        });

        it('should handle errors', async () => {
            const mockError = new Error('Database error');
            mockRequest.query.mockRejectedValue(mockError);

            const mockApplication = {
                email: 'test@example.com',
                justification: 'Justification text',
            };

            await expect(insertFundingApp(mockApplication)).rejects.toThrow('Database error');
 //           expect(mockPool.connect).toHaveBeenCalled();
  //          expect(mockPool.close).toHaveBeenCalled();
        });
    });

    describe('updateFundingApp', () => {
        it('should update a funding application and return success message', async () => {
            const mockApplication = {
                email: 'test@example.com',
                verdict: 'approved',
            };
            const mockResult = {
                rowsAffected: [1],
            };
            mockRequest.query.mockResolvedValue(mockResult);

            const response = await updateFundingApp(mockApplication);

            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`UPDATE [fundersApps] SET evaluated = 1 WHERE applicant_email = '${mockApplication.email}'`));
            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
            expect(response).toEqual({ message: 'Successfully Evaluted and approved' });
        });

        it('should handle errors', async () => {
            const mockError = new Error('Database error');
            mockRequest.query.mockRejectedValue(mockError);

            const mockApplication = {
                email: 'test@example.com',
                verdict: 'approved',
            };

            await expect(updateFundingApp(mockApplication)).rejects.toThrow('Database error');
    //        expect(mockPool.connect).toHaveBeenCalled();
    //        expect(mockPool.close).toHaveBeenCalled();
        });
    });
});
