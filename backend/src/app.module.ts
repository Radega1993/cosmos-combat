import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LobbyModule } from './lobby/lobby.module';
import { GatewayModule } from './gateway/gateway.module';
import { CharactersModule } from './characters/characters.module';
import { CardsModule } from './cards/cards.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const uri = configService.get<string>('MONGODB_URI') ||
                    'mongodb://admin:admin123@localhost:27019/cosmos-combat?authSource=admin';
                console.log(`🔌 Connecting to MongoDB: ${uri.replace(/:[^:@]+@/, ':****@')}`);
                return {
                    uri,
                };
            },
            inject: [ConfigService],
        }),
        DatabaseModule,
        AuthModule,
        AdminModule,
        LobbyModule,
        GatewayModule,
        CharactersModule,
        CardsModule,
        GameModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
