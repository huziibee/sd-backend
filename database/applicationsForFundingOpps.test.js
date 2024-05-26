// Import the necessary modules and functions
const { readapplicationsForFundingOpps, insertApplicationsForFundingOpps, updateApplicationsForFundingOpps } = require('./applicationsForFundingOpps.js');
const { ConnectionPool } = require('mssql');

// Mocking the ConnectionPool and request methods
jest.mock('mssql', () => {
  const mssql = jest.requireActual('mssql');
  return {
    ...mssql,
    ConnectionPool: jest.fn(),
  };
});

// Mocking the ConnectionPool prototype methods
const mockPoolRequestQuery = jest.fn();
ConnectionPool.prototype.connect = jest.fn();
ConnectionPool.prototype.request = jest.fn(() => ({
  query: mockPoolRequestQuery,
}));
ConnectionPool.prototype.close = jest.fn();

// Test cases for readapplicationsForFundingOpps function
describe('readapplicationsForFundingOpps', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should read applications for funding opportunities', async () => {
    // Mocking the query result
    mockPoolRequestQuery.mockResolvedValueOnce({
      recordset: [{ id: 1, applicant_motivation: 'Motivation 1', status: 'Pending' }],
    });

    // Call the function with a mock tenant ID
    const result = await readapplicationsForFundingOpps('tenant_id_123');

    // Assertions
    expect(ConnectionPool).toHaveBeenCalledWith(expect.anything());
    expect(ConnectionPool.prototype.connect).toHaveBeenCalled();
    expect(mockPoolRequestQuery).toHaveBeenCalledWith(expect.any(String));
    expect(ConnectionPool.prototype.close).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Success',
      applications: [{ id: 1, applicant_motivation: 'Motivation 1', status: 'Pending' }],
    });
  });
});

// Test cases for insertApplicationsForFundingOpps function
describe('insertApplicationsForFundingOpps', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should insert application for funding opportunities', async () => {
    // Mocking the query result
    mockPoolRequestQuery.mockResolvedValueOnce({
      rowsAffected: [1],
    });

    // Call the function with a mock object
    const result = await insertApplicationsForFundingOpps({
      fk_tenant_id: 'tenant_id_123',
      fundingOpp_ID: 'funding_opp_id_456',
      applicant_motivation: 'Motivation 2',
      applicant_documents: 'Documents 2',
    });

    // Assertions
    expect(ConnectionPool).toHaveBeenCalledWith(expect.anything());
    expect(ConnectionPool.prototype.connect).toHaveBeenCalled();
    expect(mockPoolRequestQuery).toHaveBeenCalledWith(expect.any(String));
    expect(ConnectionPool.prototype.close).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Success' });
  });
});

// Test cases for updateApplicationsForFundingOpps function
describe('updateApplicationsForFundingOpps', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update application for funding opportunities', async () => {
    // Mocking the query result
    mockPoolRequestQuery.mockResolvedValueOnce({
      rowsAffected: [1],
    });

    // Call the function with a mock object
    const result = await updateApplicationsForFundingOpps({
      id: 1,
      verdict: 'Approved',
    });

    // Assertions
    expect(ConnectionPool).toHaveBeenCalledWith(expect.anything());
    expect(ConnectionPool.prototype.connect).toHaveBeenCalled();
    expect(mockPoolRequestQuery).toHaveBeenCalledWith(expect.any(String));
    expect(ConnectionPool.prototype.close).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Success' });
  });
});
