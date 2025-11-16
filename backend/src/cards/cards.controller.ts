import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
    constructor(private readonly cardsService: CardsService) { }

    @Get()
    async findAll(@Query('type') type?: string) {
        if (type) {
            return await this.cardsService.findByType(type);
        }
        return await this.cardsService.findAll();
    }

    @Get('batch')
    async findByIds(@Query('ids') ids: string) {
        if (!ids) {
            return [];
        }
        const idArray = ids.split(',').filter(Boolean);
        return await this.cardsService.findByIds(idArray);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const card = await this.cardsService.findOne(id);
        if (!card) {
            throw new NotFoundException(`Card with id ${id} not found`);
        }
        return card;
    }
}

