import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger, ValidationPipe} from '@nestjs/common';
import cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const logger = new Logger('Bootstrap');
    app.use(cookieParser());

    // Bật CORS cho frontend gọi kèm cookie (credentials)
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });

    // Bắt buộc validate toàn bộ DTO (class-validator) trên mọi route
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen(process.env.PORT || 5000);
    logger.log('App is running');
}

void bootstrap();
