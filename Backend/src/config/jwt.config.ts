import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_TOKEN_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
  TTL: parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '3600', 10), // jwt time to live
  refreshTTL: parseInt(process.env.JWT_REFRESH_TOKEN_TTL ?? '86400', 10), // refresh token time to live
  //   googleClientId: process.env.GOOGLE_CLIENT_ID,
  //   googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
}));
