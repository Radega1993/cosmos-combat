import { Controller, Put, Param, Body, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/schemas/user.schema';
import { Skill } from '../database/schemas/skill.schema';
import { Card } from '../database/schemas/card.schema';
import { Character } from '../database/schemas/character.schema';
import { CharactersService } from '../characters/characters.service';
import { CardsService } from '../cards/cards.service';
import { SkillsService } from '../skills/skills.service';
import { readdir } from 'fs/promises';
import { join } from 'path';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(
        private adminService: AdminService,
        private charactersService: CharactersService,
        private cardsService: CardsService,
        private skillsService: SkillsService,
    ) { }

    // Get all items (including inactive) for admin panel
    @Get('characters')
    async getAllCharacters() {
        return this.charactersService.findAllIncludingInactive();
    }

    @Get('cards')
    async getAllCards() {
        return this.cardsService.findAllIncludingInactive();
    }

    @Get('skills')
    async getAllSkills() {
        return this.skillsService.findAllIncludingInactive();
    }

    // Get available images
    @Get('images/cards')
    async getCardImages() {
        return this.adminService.getCardImages();
    }

    @Get('images/characters')
    async getCharacterImages() {
        return this.adminService.getCharacterImages();
    }

    // Skills endpoints
    @Put('skills/:id')
    async updateSkill(@Param('id') id: string, @Body() updateData: Partial<Skill>) {
        return this.adminService.updateSkill(id, updateData);
    }

    @Put('skills/:id/toggle')
    async toggleSkillActive(@Param('id') id: string) {
        return this.adminService.toggleSkillActive(id);
    }

    // Cards endpoints
    @Put('cards/:id')
    async updateCard(@Param('id') id: string, @Body() updateData: Partial<Card>) {
        return this.adminService.updateCard(id, updateData);
    }

    @Put('cards/:id/toggle')
    async toggleCardActive(@Param('id') id: string) {
        return this.adminService.toggleCardActive(id);
    }

    // Characters endpoints
    @Put('characters/:id')
    async updateCharacter(@Param('id') id: string, @Body() updateData: Partial<Character>) {
        return this.adminService.updateCharacter(id, updateData);
    }

    @Put('characters/:id/toggle')
    async toggleCharacterActive(@Param('id') id: string) {
        return this.adminService.toggleCharacterActive(id);
    }

    // Game Balance endpoints
    @Get('balance')
    async getGameBalance() {
        return this.adminService.getGameBalance();
    }

    @Put('balance')
    async updateGameBalance(@Body() updateData: any) {
        return this.adminService.updateGameBalance(updateData);
    }
}
