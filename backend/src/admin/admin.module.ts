import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Skill, SkillSchema } from '../database/schemas/skill.schema';
import { Card, CardSchema } from '../database/schemas/card.schema';
import { Character, CharacterSchema } from '../database/schemas/character.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Skill.name, schema: SkillSchema },
            { name: Card.name, schema: CardSchema },
            { name: Character.name, schema: CharacterSchema },
        ]),
        AuthModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }

