const { readFundApps, insertFundingApp, updateFundingApp } = require('./fundApps.js');
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

describe('readFundApps', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should read funding applications', async () => {
    // Mocking the query result
    mockPoolRequestQuery.mockResolvedValueOnce({
      recordset: [{ id: 1, justification: 'Justification 1', evaluated: 0 }],
    });

    // Call the function
    const result = await readFundApps();

    // Assertions
    // expect(ConnectionPool).toHaveBeenCalledWith(expect.anything());
    expect(ConnectionPool.prototype.connect).toHaveBeenCalled();
    expect(mockPoolRequestQuery).toHaveBeenCalledWith(expect.any(String));
    expect(ConnectionPool.prototype.close).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Success',
      applications: [{ id: 1, justification: 'Justification 1', evaluated: 0 }],
    });
  });
});

describe('insertFundingApp', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should insert a funding application', async () => {
    // Mocking the query result
    mockPoolRequestQuery.mockResolvedValueOnce({
      rowsAffected: [1],
    });

    // Call the function
    const result = await insertFundingApp({
      fk_tenant_id: 'tenant_id_123',
      justification: 'Justification 2',
      document: 'Document 2',
    });

    // Assertions
    // expect(ConnectionPool).toHaveBeenCalledWith(expect.anything());
    expect(ConnectionPool.prototype.connect).toHaveBeenCalled();
    expect(mockPoolRequestQuery).toHaveBeenCalledWith(expect.any(String));
    expect(ConnectionPool.prototype.close).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Success' });
  });
});

describe('updateFundingApp', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a funding application and user type', async () => {
    // Mocking the query results
    mockPoolRequestQuery
      .mockResolvedValueOnce({ rowsAffected: [1] }) // Update fundersApps
      .mockResolvedValueOnce({ rowsAffected: [1] }); // Update User

    // Call the function
    const result = await updateFundingApp({ id: 'tenant_id_123', verdict: 1 });

    // Assertions
    // expect(ConnectionPool).toHaveBeenCalledWith(expect.anything());
    expect(ConnectionPool.prototype.connect).toHaveBeenCalled();
    expect(mockPoolRequestQuery).toHaveBeenCalledWith(expect.any(String));
    expect(ConnectionPool.prototype.close).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Successfully Evaluted and approved', status: 'Success' });
  });

//   it('should update a funding application without updating user type', async () => {
//     // Mocking the query result
//     mockPoolRequestQuery.mockResolvedValueOnce({ rowsAffected: [1] });

//     // Call the function
//     const result = await updateFundingApp({ id: 'tenant_id_123', verdict: 0 });

//     // Assertions
//     expect(ConnectionPool).toHaveBeenCalledWith(expect.anything());
//     expect(ConnectionPool.prototype.connect).toHaveBeenCalled();
//     expect(mockPoolRequestQuery).toHaveBeenCalledWith(expect.any(String));
//     expect(ConnectionPool.prototype.close).toHaveBeenCalled();
//     expect(result).toEqual({ message: 'Successfully Evaluated and rejected', status: 'Success' });
//   });
});
