import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/jwt-auth.guard';

/**
 * @Public() decorator
 * Marks a route as public, bypassing JWT authentication
 * Usage: @Public() on controller methods
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
