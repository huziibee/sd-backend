const { ConnectionPool } = require('mssql');
const { insertFundingOpp, readFundOppsForFM, updateFundingOpp, readFundOpps } = require('./fundingOpps.js');

jest.mock('mssql');

describe('fundingOpps.js', () => {
    let poolConnectMock;
    let poolCloseMock;
    let requestMock;
    let queryMock;

    beforeEach(() => {
        poolConnectMock = jest.fn().mockResolvedValue();
        poolCloseMock = jest.fn().mockResolvedValue();
        queryMock = jest.fn();

        ConnectionPool.mockImplementation(() => ({
            connect: poolConnectMock,
            close: poolCloseMock,
            request: jest.fn(() => ({
                query: queryMock
            }))
        }));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('insertFundingOpp', () => {
        it('should insert a funding opportunity successfully', async () => {
            queryMock.mockResolvedValue({ rowsAffected: [1] });

            const fundingOpp = {
                title: 'New Funding',
                summary: 'Summary',
                description: 'Description',
                fund_manager_email: 'manager@example.com',
                end_date: '2024-12-31',
                type: 'Grant',
                amount: 10000
            };

            const result = await insertFundingOpp(fundingOpp);

            expect(result).toEqual({ message: 'Success' });
            expect(queryMock).toHaveBeenCalledTimes(1);
        });

        it('should handle existing funding opportunity', async () => {
            queryMock.mockResolvedValue({ rowsAffected: [0] });

            const fundingOpp = {
                title: 'Existing Funding',
                summary: 'Summary',
                description: 'Description',
                fund_manager_email: 'manager@example.com',
                end_date: '2024-12-31',
                type: 'Grant',
                amount: 10000
            };

            const result = await insertFundingOpp(fundingOpp);

            expect(result).toEqual({ message: 'Object already exists in the database' });
            expect(queryMock).toHaveBeenCalledTimes(1);
        });

        it('should handle errors during insert', async () => {
            queryMock.mockRejectedValue(new Error('Insert failed'));

            const fundingOpp = {
                title: 'New Funding',
                summary: 'Summary',
                description: 'Description',
                fund_manager_email: 'manager@example.com',
                end_date: '2024-12-31',
                type: 'Grant',
                amount: 10000
            };

            await expect(insertFundingOpp(fundingOpp)).rejects.toThrow('Insert failed');
            expect(queryMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('readFundOpps', () => {
        it('should return approved funding opportunities', async () => {
            const mockResultSet = {
                recordset: [
                    { id: 1, title: 'Funding 1', approved: 1 },
                    { id: 2, title: 'Funding 2', approved: 1 }
                ]
            };
            queryMock.mockResolvedValue(mockResultSet);

            const email = 'test@example.com';
            const result = await readFundOpps(email);

            expect(result).toEqual(mockResultSet.recordset);
            expect(queryMock).toHaveBeenCalledTimes(1);
        });

        it('should handle errors during read', async () => {
            queryMock.mockRejectedValue(new Error('Read failed'));

            const email = 'test@example.com';

            await expect(readFundOpps(email)).rejects.toThrow('Read failed');
            expect(queryMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('readFundOppsForFM', () => {
        it('should return funding opportunities for a specific fund manager', async () => {
            const mockResultSet = {
                recordset: [
                    { id: 1, title: 'Funding 1', approved: 1, fund_manager_email: 'fm@example.com' },
                    { id: 2, title: 'Funding 2', approved: 1, fund_manager_email: 'fm@example.com' }
                ]
            };
            queryMock.mockResolvedValue(mockResultSet);

            const email = 'fm@example.com';
            const result = await readFundOppsForFM(email);

            expect(result).toEqual(mockResultSet.recordset);
            expect(queryMock).toHaveBeenCalledTimes(1);
        });

        it('should handle errors during read for fund manager', async () => {
            queryMock.mockRejectedValue(new Error('Read failed'));

            const email = 'fm@example.com';

            await expect(readFundOppsForFM(email)).rejects.toThrow('Read failed');
            expect(queryMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateFundingOpp', () => {
        it('should update a funding opportunity successfully', async () => {
            queryMock.mockResolvedValue({ rowsAffected: [1] });

            const fundingOpp = {
                id: 1,
                title: 'Updated Funding',
                summary: 'Updated Summary',
                type: 'Grant',
                amount: 15000
            };

            const result = await updateFundingOpp(fundingOpp);

            expect(result).toEqual({ message: 'Success' });
            expect(queryMock).toHaveBeenCalledTimes(1);
        });

        it('should handle non-existent funding opportunity', async () => {
            queryMock.mockResolvedValue({ rowsAffected: [0] });

            const fundingOpp = {
                id: 1,
                title: 'Non-existent Funding',
                summary: 'Summary',
                type: 'Grant',
                amount: 15000
            };

            const result = await updateFundingOpp(fundingOpp);

            expect(result).toEqual({ message: 'Object does not exist in the database' });
            expect(queryMock).toHaveBeenCalledTimes(1);
        });

        it('should handle errors during update', async () => {
            queryMock.mockRejectedValue(new Error('Update failed'));

            const fundingOpp = {
                id: 1,
                title: 'Updated Funding',
                summary: 'Updated Summary',
                type: 'Grant',
                amount: 15000
            };

            await expect(updateFundingOpp(fundingOpp)).rejects.toThrow('Update failed');
            expect(queryMock).toHaveBeenCalledTimes(1);
        });
    });
});
