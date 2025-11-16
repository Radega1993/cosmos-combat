import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from '../database/schemas/card.schema';

@Injectable()
export class CardsService {
    constructor(
        @InjectModel(Card.name)
        private cardModel: Model<CardDocument>,
    ) { }

    async findAll(): Promise<Card[]> {
        return await this.cardModel.find({ isActive: true }).exec();
    }

    async findOne(id: string): Promise<Card | null> {
        return await this.cardModel.findOne({ id, isActive: true }).exec();
    }

    async findByIds(ids: string[]): Promise<Card[]> {
        return await this.cardModel.find({ id: { $in: ids }, isActive: true }).exec();
    }

    async findByType(type: string): Promise<Card[]> {
        return await this.cardModel.find({ type, isActive: true }).exec();
    }
}

