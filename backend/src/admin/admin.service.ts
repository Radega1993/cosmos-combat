import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from '../database/schemas/skill.schema';
import { Card, CardDocument } from '../database/schemas/card.schema';
import { Character, CharacterDocument } from '../database/schemas/character.schema';
import { GameBalance, GameBalanceDocument } from '../database/schemas/game-balance.schema';
import { readdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Skill.name)
        private skillModel: Model<SkillDocument>,
        @InjectModel(Card.name)
        private cardModel: Model<CardDocument>,
        @InjectModel(Character.name)
        private characterModel: Model<CharacterDocument>,
        @InjectModel(GameBalance.name)
        private gameBalanceModel: Model<GameBalanceDocument>,
    ) { }

    // Get available card images
    async getCardImages(): Promise<string[]> {
        try {
            // deck_img is in the project root, not in backend/
            const projectRoot = process.cwd().endsWith('backend') 
                ? join(process.cwd(), '..') 
                : process.cwd();
            const imagesPath = join(projectRoot, 'deck_img', 'finales mazo');
            const files = await readdir(imagesPath);
            return files
                .filter((file) => file.endsWith('.png') || file.endsWith('.jpg'))
                .map((file) => `/deck_img/finales mazo/${encodeURIComponent(file)}`);
        } catch (error) {
            console.error('Error reading card images:', error);
            return [];
        }
    }

    // Get available character images
    async getCharacterImages(): Promise<string[]> {
        try {
            // deck_img is in the project root, not in backend/
            const projectRoot = process.cwd().endsWith('backend') 
                ? join(process.cwd(), '..') 
                : process.cwd();
            const imagesPath = join(projectRoot, 'deck_img', 'finales personajes');
            const files = await readdir(imagesPath);
            return files
                .filter((file) => file.endsWith('.png') || file.endsWith('.jpg'))
                .map((file) => `/deck_img/finales personajes/${encodeURIComponent(file)}`);
        } catch (error) {
            console.error('Error reading character images:', error);
            return [];
        }
    }

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

    // Game Balance management
    async getGameBalance(): Promise<GameBalance | null> {
        return await this.gameBalanceModel.findOne({ isActive: true }).exec();
    }

    async updateGameBalance(updateData: Partial<GameBalance>): Promise<GameBalance> {
        const balance = await this.gameBalanceModel.findOne({ isActive: true }).exec();
        if (!balance) {
            throw new NotFoundException('Active game balance not found');
        }

        Object.assign(balance, updateData);
        return await balance.save();
    }
}

