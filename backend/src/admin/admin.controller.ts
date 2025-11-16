import { Controller, Put, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/schemas/user.schema';
import { Skill } from '../database/schemas/skill.schema';
import { Card } from '../database/schemas/card.schema';
import { Character } from '../database/schemas/character.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private adminService: AdminService) { }

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
}

