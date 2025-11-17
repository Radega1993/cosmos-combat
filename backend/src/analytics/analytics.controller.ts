import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/schemas/user.schema';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    /**
     * Get character win rates
     */
    @Get('character-win-rates')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getCharacterWinRates(
        @Query('balanceVersion') balanceVersion?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.analyticsService.getCharacterWinRates(balanceVersion, startDate, endDate);
    }

    /**
     * Get card usage statistics
     */
    @Get('card-usage')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getCardUsage(
        @Query('balanceVersion') balanceVersion?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.analyticsService.getCardUsage(balanceVersion, startDate, endDate);
    }

    /**
     * Get game duration statistics
     */
    @Get('game-durations')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getGameDurations(
        @Query('balanceVersion') balanceVersion?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.analyticsService.getGameDurations(balanceVersion, startDate, endDate);
    }

    /**
     * Get player statistics
     */
    @Get('player-stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getPlayerStats(
        @Query('playerId') playerId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.analyticsService.getPlayerStats(playerId, startDate, endDate);
    }

    /**
     * Get overall game statistics
     */
    @Get('overall-stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getOverallStats(
        @Query('balanceVersion') balanceVersion?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.analyticsService.getOverallStats(balanceVersion, startDate, endDate);
    }

    /**
     * Export game data
     */
    @Get('export')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async exportData(
        @Query('format') format: 'json' | 'csv' = 'json',
        @Query('balanceVersion') balanceVersion?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.analyticsService.exportData(format, balanceVersion, startDate, endDate);
    }
}

