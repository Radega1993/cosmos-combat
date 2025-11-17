import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Character, CharacterDocument } from '../database/schemas/character.schema';

@Injectable()
export class CharactersService {
    constructor(
        @InjectModel(Character.name)
        private characterModel: Model<CharacterDocument>,
    ) { }

    async findAll(): Promise<Character[]> {
        return await this.characterModel.find({ isActive: true }).exec();
    }

    async findOne(id: string): Promise<Character | null> {
        return await this.characterModel.findOne({ id, isActive: true }).exec();
    }

    async findByIds(ids: string[]): Promise<Character[]> {
        return await this.characterModel.find({ id: { $in: ids }, isActive: true }).exec();
    }

    /**
     * Get all characters (including inactive) - for admin use
     */
    async findAllIncludingInactive(): Promise<Character[]> {
        return await this.characterModel.find({}).exec();
    }
}

