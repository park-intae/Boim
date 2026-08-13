import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should wrap response data in success wrapper', (done) => {
    const mockExecutionContext = {} as ExecutionContext;
    const mockCallHandler = {
      handle: () => of({ test: 'data' }),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({
          success: true,
          data: { test: 'data' },
        });
        done();
      },
    });
  });
});
