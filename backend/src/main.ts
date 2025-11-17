import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // Serve static files from deck_img directory
    app.useStaticAssets(join(process.cwd(), 'deck_img'), {
        prefix: '/deck_img',
    });

    // Enable CORS
    app.enableCors({
        origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000',
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const port = configService.get('PORT') || 3001;
    await app.listen(port);

    console.log(`🚀 Backend server running on: http://localhost:${port}`);
    console.log(`📡 WebSocket available at: ws://localhost:${port}/socket.io`);
    console.log(`🖼️  Static files served from: /deck_img`);
}

bootstrap();

