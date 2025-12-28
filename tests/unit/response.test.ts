import { sendSuccess, sendError, sendFastSuccess } from '../../lib/utils/response';
import { Response } from 'express';

// Mock Express Response
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('Response Utils', () => {
  it('sendSuccess should format response correctly', () => {
    const res = mockResponse();
    const data = { id: 1, name: 'Test' };
    
    sendSuccess(res, 200, 'Success', data);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data,
    });
  });

  it('sendSuccess should handle BigInt', () => {
    const res = mockResponse();
    const data = { id: BigInt(123) };
    
    sendSuccess(res, 200, 'Success', data);
    
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: { id: '123' },
    });
  });

  it('sendError should format error response', () => {
    const res = mockResponse();
    const errors = { field: 'Required' };
    
    sendError(res, 400, 'Bad Request', errors);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Bad Request',
      errors,
    });
  });

  it('sendFastSuccess should use serializer', () => {
    const res = mockResponse();
    const data = { id: 1 };
    const serializer = jest.fn().mockReturnValue('{"serialized": true}');
    
    sendFastSuccess(res, 200, serializer, data);
    
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(serializer).toHaveBeenCalledWith(data);
    expect(res.send).toHaveBeenCalledWith('{"serialized": true}');
  });
});
