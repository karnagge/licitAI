import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Local Authentication Guard
 * Uses Passport Local strategy to validate email/password
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
