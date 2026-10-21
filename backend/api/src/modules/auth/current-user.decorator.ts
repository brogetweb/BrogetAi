import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessPayload } from './auth.types';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<{ user: AccessPayload }>();
  return request.user;
});
