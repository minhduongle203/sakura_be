import { registerAs } from '@nestjs/config';

export const DATABASE_REGISTER = 'database';

export default registerAs(DATABASE_REGISTER, () => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5434', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../../entities/*.entity.{ts,js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: true,
}));
