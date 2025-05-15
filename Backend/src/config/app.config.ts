import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => {
  return { port: process.env.PORT };
});
