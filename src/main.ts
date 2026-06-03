import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger} from '@nestjs/common';
import cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const logger = new Logger('Bootstrap');
    app.use(cookieParser());

    await app.listen(process.env.PORT || 5000);
    logger.log('App is running');
}

void bootstrap();
