const { ConnectionPool } = require('mssql');
const { connectionString } = require('./config');
const {
    insertApplicationsForFundingOpps,
    readapplicationsForFundingOpps,
    updateApplicationsForFundingOpps,
} = require('./applicationsForFundingOpps');

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

    describe('readapplicationsForFundingOpps', () => {
        it('should return application data for a valid email', async () => {
            const mockEmail = 'test@example.com';
            const mockResult = {
                recordset: [{ id: 1, applicant_email: mockEmail, status: 'pending' }],
            };
            mockRequest.query.mockResolvedValue(mockResult);

            const applications = await readapplicationsForFundingOpps(mockEmail);

            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`WHERE F.fund_manager_email = '${mockEmail}'`));
            expect(mockPool.close).toHaveBeenCalled();
            expect(applications).toEqual(mockResult.recordset);
        });

        it('should handle errors', async () => {
            const mockError = new Error('Database error');
            mockRequest.query.mockRejectedValue(mockError);

            await expect(readapplicationsForFundingOpps('test@example.com')).rejects.toThrow('Database error');
            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });
    });

    describe('insertApplicationsForFundingOpps', () => {
        it('should insert application data and return success message', async () => {
            const mockApplication = {
                applicant_email: 'test@example.com',
                fundingOpp_ID: 1,
                applicant_motivation: 'Motivation text',
                applicant_documents: 'Documents text',
            };
            const mockResult = {
                rowsAffected: [1],
            };
            mockRequest.query.mockResolvedValue(mockResult);

            const response = await insertApplicationsForFundingOpps(mockApplication);

            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`INSERT INTO applicationsForFundingOpps (applicant_email, fundingOpp_ID, applicant_motivation, applicant_documents)`));
            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
            expect(response).toEqual({ message: 'Success' });
        });

        it('should handle errors', async () => {
            const mockError = new Error('Database error');
            mockRequest.query.mockRejectedValue(mockError);

            const mockApplication = {
                applicant_email: 'test@example.com',
                fundingOpp_ID: 1,
                applicant_motivation: 'Motivation text',
                applicant_documents: 'Documents text',
            };

            await expect(insertApplicationsForFundingOpps(mockApplication)).rejects.toThrow('Database error');
            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });
    });

    describe('updateApplicationsForFundingOpps', () => {
        it('should update application status and return success message', async () => {
            const mockApplication = {
                id: 1,
                status: 'approved',
            };
            const mockResult = {
                rowsAffected: [1],
            };
            mockRequest.query.mockResolvedValue(mockResult);

            const response = await updateApplicationsForFundingOpps(mockApplication);

            expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining(`UPDATE applicationsForFundingOpps SET status = '${mockApplication.status}' WHERE id = ${mockApplication.id}`));
            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
            expect(response).toEqual({ message: 'Success' });
        });

        it('should handle errors', async () => {
            const mockError = new Error('Database error');
            mockRequest.query.mockRejectedValue(mockError);

            const mockApplication = {
                id: 1,
                status: 'approved',
            };

            await expect(updateApplicationsForFundingOpps(mockApplication)).rejects.toThrow('Database error');
            expect(mockPool.connect).toHaveBeenCalled();
            expect(mockPool.close).toHaveBeenCalled();
        });
    });
});
