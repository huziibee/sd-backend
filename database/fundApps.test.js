const { ConnectionPool } = require('mssql');
const { connectionString } = require('./config');

jest.mock('mssql');

let mockPool;
let mockRequest;

beforeEach(() => {
    mockRequest = {
        query: jest.fn(),
    };

    mockPool = {
        connect: jest.fn().mockResolvedValue(mockPool),
        close: jest.fn().mockResolvedValue(undefined),
        request: jest.fn().mockReturnValue(mockRequest),
    };

    ConnectionPool.mockImplementation(() => mockPool);
});

afterEach(() => {
    jest.clearAllMocks();
});

const { insertFundingApp, readFundApps, updateFundingApp } = require('./fundApps');

describe('readFundApps', () => {
    it('should return all funding applications that are not evaluated', async () => {
        const mockResult = {
            recordset: [{ id: 1, applicant_email: 'applicant@example.com' }],
        };
        mockRequest.query.mockResolvedValue(mockResult);

        const response = await readFundApps();

        expect(mockRequest.query).toHaveBeenCalledWith('select * from [fundersApps] where evaluated = 0;');
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual([{ id: 1, applicant_email: 'applicant@example.com' }]);
    });

    it('should handle errors', async () => {
        const mockError = new Error('Database error');
        mockRequest.query.mockRejectedValue(mockError);

        await expect(readFundApps()).rejects.toThrow('Database error');
        expect(mockPool.close).toHaveBeenCalled();
    });
});

describe('insertFundingApp', () => {
    it('should insert a funding application and return success message if not exists', async () => {
        const mockObject = {
            email: 'applicant@example.com',
            justification: 'Justification text',
        };
        const mockResult = {
            rowsAffected: [1],
        };
        mockRequest.query.mockResolvedValue(mockResult);

        const response = await insertFundingApp(mockObject);

        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`INSERT INTO fundersApps`));
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual({ message: 'Success' });
    });

    it('should return failure message if funding application already exists', async () => {
        const mockObject = {
            email: 'applicant@example.com',
            justification: 'Justification text',
        };
        const mockResult = {
            rowsAffected: [0],
        };
        mockRequest.query.mockResolvedValue(mockResult);

        const response = await insertFundingApp(mockObject);

        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`WHERE NOT EXISTS`));
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual({ message: 'Failure' });
    });

    it('should handle errors', async () => {
        const mockError = new Error('Database error');
        mockRequest.query.mockRejectedValue(mockError);

        await expect(insertFundingApp({
            email: 'applicant@example.com',
            justification: 'Justification text',
        })).rejects.toThrow('Database error');
        expect(mockPool.close).toHaveBeenCalled();
    });
});

describe('updateFundingApp', () => {
    it('should evaluate the funding application and return success message if approved', async () => {
        const mockObject = {
            email: 'applicant@example.com',
            verdict: 'Approved',
        };
        const mockResult = {
            rowsAffected: [1],
        };
        const mockUserUpdateResult = {
            rowsAffected: [1],
        };

        mockRequest.query
            .mockResolvedValueOnce(mockResult)
            .mockResolvedValueOnce(mockUserUpdateResult);

        const response = await updateFundingApp(mockObject);

        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`UPDATE [fundersApps] SET evaluated = 1 WHERE applicant_email = '${mockObject.email}';`));
        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`UPDATE [User] SET user_type = 'Fund Manager' WHERE email = '${mockObject.email}';`));
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual({ message: 'Successfully Evaluted and approved' });
    });

    it('should evaluate the funding application and return success message if rejected', async () => {
        const mockObject = {
            email: 'applicant@example.com',
            verdict: 'Rejected',
        };
        const mockResult = {
            rowsAffected: [1],
        };

        mockRequest.query.mockResolvedValue(mockResult);

        const response = await updateFundingApp(mockObject);

        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`UPDATE [fundersApps] SET evaluated = 1 WHERE applicant_email = '${mockObject.email}';`));
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual({ message: 'Successfully Evaluated and rejected' });
    });

    it('should handle errors', async () => {
        const mockError = new Error('Database error');
        mockRequest.query.mockRejectedValue(mockError);

        await expect(updateFundingApp({
            email: 'applicant@example.com',
            verdict: 'Approved',
        })).rejects.toThrow('Database error');
        expect(mockPool.close).toHaveBeenCalled();
    });
});
