import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { Skill, SkillSchema } from '../database/schemas/skill.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Skill.name, schema: SkillSchema },
        ]),
    ],
    controllers: [SkillsController],
    providers: [SkillsService],
    exports: [SkillsService],
})
export class SkillsModule { }

