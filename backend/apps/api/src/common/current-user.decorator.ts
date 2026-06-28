import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { AuthenticatedUser } from '@app/config';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<
      Request & { user: AuthenticatedUser }
    >();
    return request.user;
  },
);
