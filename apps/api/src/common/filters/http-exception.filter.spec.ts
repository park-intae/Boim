import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should catch HttpException and format response', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockHttpArgumentsHost = jest
      .fn()
      .mockReturnValue({ getResponse: mockGetResponse });
    const mockArgumentsHost = {
      switchToHttp: mockHttpArgumentsHost,
    } as any;

    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: {
        code: '403',
        message: 'Forbidden',
      },
    });
  });

  it('should catch non-HttpException as Internal Server Error', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockHttpArgumentsHost = jest
      .fn()
      .mockReturnValue({ getResponse: mockGetResponse });
    const mockArgumentsHost = {
      switchToHttp: mockHttpArgumentsHost,
    } as any;

    const exception = new Error('Unknown error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: {
        code: '500',
        message: 'Internal Server Error',
      },
    });
  });
});
