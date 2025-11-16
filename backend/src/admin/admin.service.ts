import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from '../database/schemas/skill.schema';
import { Card, CardDocument } from '../database/schemas/card.schema';
import { Character, CharacterDocument } from '../database/schemas/character.schema';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Skill.name)
        private skillModel: Model<SkillDocument>,
        @InjectModel(Card.name)
        private cardModel: Model<CardDocument>,
        @InjectModel(Character.name)
        private characterModel: Model<CharacterDocument>,
    ) { }

    // Skills management
    async updateSkill(skillId: string, updateData: Partial<Skill>): Promise<Skill> {
        const skill = await this.skillModel.findOneAndUpdate(
            { id: skillId },
            { $set: updateData },
            { new: true },
        ).exec();

        if (!skill) {
            throw new NotFoundException(`Skill with id ${skillId} not found`);
        }

        return skill;
    }

    async toggleSkillActive(skillId: string): Promise<Skill> {
        const skill = await this.skillModel.findOne({ id: skillId }).exec();
        if (!skill) {
            throw new NotFoundException(`Skill with id ${skillId} not found`);
        }

        skill.isActive = !skill.isActive;
        return await skill.save();
    }

    // Cards management
    async updateCard(cardId: string, updateData: Partial<Card>): Promise<Card> {
        const card = await this.cardModel.findOneAndUpdate(
            { id: cardId },
            { $set: updateData },
            { new: true },
        ).exec();

        if (!card) {
            throw new NotFoundException(`Card with id ${cardId} not found`);
        }

        return card;
    }

    async toggleCardActive(cardId: string): Promise<Card> {
        const card = await this.cardModel.findOne({ id: cardId }).exec();
        if (!card) {
            throw new NotFoundException(`Card with id ${cardId} not found`);
        }

        card.isActive = !card.isActive;
        return await card.save();
    }

    // Characters management
    async updateCharacter(characterId: string, updateData: Partial<Character>): Promise<Character> {
        const character = await this.characterModel.findOneAndUpdate(
            { id: characterId },
            { $set: updateData },
            { new: true },
        ).exec();

        if (!character) {
            throw new NotFoundException(`Character with id ${characterId} not found`);
        }

        return character;
    }

    async toggleCharacterActive(characterId: string): Promise<Character> {
        const character = await this.characterModel.findOne({ id: characterId }).exec();
        if (!character) {
            throw new NotFoundException(`Character with id ${characterId} not found`);
        }

        character.isActive = !character.isActive;
        return await character.save();
    }
}

