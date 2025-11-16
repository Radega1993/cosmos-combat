import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from '../database/schemas/skill.schema';

@Injectable()
export class SkillsService {
    constructor(
        @InjectModel(Skill.name)
        private skillModel: Model<SkillDocument>,
    ) { }

    /**
     * Get all active skills
     */
    async findAll(): Promise<Skill[]> {
        return await this.skillModel.find({ isActive: true }).exec();
    }

    /**
     * Get a skill by ID
     */
    async findOne(id: string): Promise<Skill | null> {
        return await this.skillModel.findOne({ id, isActive: true }).exec();
    }

    /**
     * Get skills by IDs
     */
    async findByIds(ids: string[]): Promise<Skill[]> {
        return await this.skillModel.find({ id: { $in: ids }, isActive: true }).exec();
    }

    /**
     * Get skills by character ID
     */
    async findByCharacter(characterId: string): Promise<Skill[]> {
        return await this.skillModel.find({ character: characterId, isActive: true }).exec();
    }

    /**
     * Get skills by multiple character IDs
     */
    async findByCharacters(characterIds: string[]): Promise<Skill[]> {
        return await this.skillModel.find({ character: { $in: characterIds }, isActive: true }).exec();
    }
}


