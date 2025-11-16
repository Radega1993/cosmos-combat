import { Controller, Get, Param, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) { }

    @Get()
    async findAll(@Query('character') characterId?: string) {
        if (characterId) {
            return await this.skillsService.findByCharacter(characterId);
        }
        return await this.skillsService.findAll();
    }

    @Get('batch')
    async findByIds(@Query('ids') ids: string) {
        const idArray = ids.split(',').filter((id) => id.trim());
        return await this.skillsService.findByIds(idArray);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.skillsService.findOne(id);
    }
}


