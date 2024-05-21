const { ConnectionPool } = require('mssql');
const { insertApplicationsForFundingOpps, readapplicationsForFundingOpps, updateApplicationsForFundingOpps } = require('./applicationsForFundingOpps.js');

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

describe('readapplicationsForFundingOpps', () => {
    it('should return applications for a given fund manager email', async () => {
        const mockEmail = 'fundmanager@example.com';
        const mockResult = {
            recordset: [{ id: 1, name: 'John Doe' }],
        };
        mockRequest.query.mockResolvedValue(mockResult);

        const response = await readapplicationsForFundingOpps(mockEmail);

        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`WHERE F.fund_manager_email = '${mockEmail}';`));
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual([{ id: 1, name: 'John Doe' }]);
    });

    it('should handle errors', async () => {
        const mockError = new Error('Database error');
        mockRequest.query.mockRejectedValue(mockError);

        await expect(readapplicationsForFundingOpps('fundmanager@example.com')).rejects.toThrow('Database error');
        expect(mockPool.close).toHaveBeenCalled();
    });
});

describe('insertApplicationsForFundingOpps', () => {
    it('should insert an application and return success message if not exists', async () => {
        const mockObject = {
            applicant_email: 'applicant@example.com',
            fundingOpp_ID: 1,
            applicant_motivation: 'Motivation text',
            applicant_documents: 'Document links',
        };
        const mockResult = {
            rowsAffected: [1],
        };
        mockRequest.query.mockResolvedValue(mockResult);

        const response = await insertApplicationsForFundingOpps(mockObject);

        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`INSERT INTO applicationsForFundingOpps`));
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual({ message: 'Success' });
    });

    it('should return failure message if application already exists', async () => {
        const mockObject = {
            applicant_email: 'applicant@example.com',
            fundingOpp_ID: 1,
            applicant_motivation: 'Motivation text',
            applicant_documents: 'Document links',
        };
        const mockResult = {
            rowsAffected: [0],
        };
        mockRequest.query.mockResolvedValue(mockResult);

        const response = await insertApplicationsForFundingOpps(mockObject);

        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`WHERE NOT EXISTS`));
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual({ message: 'Failure' });
    });

    it('should handle errors', async () => {
        const mockError = new Error('Database error');
        mockRequest.query.mockRejectedValue(mockError);

        await expect(insertApplicationsForFundingOpps({
            applicant_email: 'applicant@example.com',
            fundingOpp_ID: 1,
            applicant_motivation: 'Motivation text',
            applicant_documents: 'Document links',
        })).rejects.toThrow('Database error');
        expect(mockPool.close).toHaveBeenCalled();
    });
});

describe('updateApplicationsForFundingOpps', () => {
    it('should update the application status and return success message', async () => {
        const mockObject = {
            id: 1,
            status: 'Approved',
        };
        const mockResult = {
            rowsAffected: [1],
        };
        mockRequest.query.mockResolvedValue(mockResult);

        const response = await updateApplicationsForFundingOpps(mockObject);

        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`UPDATE applicationsForFundingOpps`));
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual({ message: 'Success' });
    });

    it('should return failure message if update does not affect any rows', async () => {
        const mockObject = {
            id: 1,
            status: 'Approved',
        };
        const mockResult = {
            rowsAffected: [0],
        };
        mockRequest.query.mockResolvedValue(mockResult);

        const response = await updateApplicationsForFundingOpps(mockObject);

        expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`WHERE id = ${mockObject.id}`));
        expect(mockPool.close).toHaveBeenCalled();
        expect(response).toEqual({ message: 'Failure' });
    });

    it('should handle errors', async () => {
        const mockError = new Error('Database error');
        mockRequest.query.mockRejectedValue(mockError);

        await expect(updateApplicationsForFundingOpps({
            id: 1,
            status: 'Approved',
        })).rejects.toThrow('Database error');
        expect(mockPool.close).toHaveBeenCalled();
    });
});
