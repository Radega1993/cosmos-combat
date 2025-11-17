import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from '../database/schemas/skill.schema';
import { Card, CardDocument } from '../database/schemas/card.schema';
import { Character, CharacterDocument } from '../database/schemas/character.schema';
import { GameBalance, GameBalanceDocument } from '../database/schemas/game-balance.schema';
import { Preset, PresetDocument } from '../database/schemas/preset.schema';
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
        @InjectModel(Preset.name)
        private presetModel: Model<PresetDocument>,
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
            const imagesPath = join(projectRoot, 'deck_img', 'personajes');
            const files = await readdir(imagesPath);
            return files
                .filter((file) => file.endsWith('.png') || file.endsWith('.jpg'))
                .map((file) => `/deck_img/personajes/${encodeURIComponent(file)}`);
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

    // Presets management
    async createPreset(name: string, description: string | undefined, createdBy: string): Promise<Preset> {
        // Check if preset with same name already exists for this user
        const existing = await this.presetModel.findOne({ name, createdBy }).exec();
        if (existing) {
            throw new ConflictException(`Preset with name "${name}" already exists`);
        }

        // Get current configuration
        // @ts-ignore - Promise.all with Mongoose types is too complex for TypeScript
        const results = await Promise.all([
            this.characterModel.find({}).exec(),
            this.cardModel.find({}).exec(),
            this.skillModel.find({}).exec(),
            this.gameBalanceModel.findOne({ isActive: true }).exec(),
        ]);
        const characters = results[0] as CharacterDocument[];
        const cards = results[1] as CardDocument[];
        const skills = results[2] as SkillDocument[];
        const balance = results[3] as GameBalanceDocument | null;

        // Build configuration object
        const configuration = {
            characters: {},
            cards: {},
            skills: {},
            balance: balance ? balance.toObject() : null,
        };

        characters.forEach((char) => {
            configuration.characters[char.id] = char.toObject();
        });

        cards.forEach((card) => {
            configuration.cards[card.id] = card.toObject();
        });

        skills.forEach((skill) => {
            configuration.skills[skill.id] = skill.toObject();
        });

        const preset = await this.presetModel.create({
            name,
            description,
            createdBy,
            configuration,
            isDefault: false,
            isActive: true,
        });

        return preset;
    }

    async getPresets(createdBy?: string): Promise<Preset[]> {
        const query: any = { isActive: true };
        if (createdBy) {
            query.createdBy = createdBy;
        }
        return await this.presetModel.find(query).sort({ createdAt: -1 }).exec();
    }

    async getPreset(id: string): Promise<Preset> {
        const preset = await this.presetModel.findById(id).exec();
        if (!preset) {
            throw new NotFoundException(`Preset with id ${id} not found`);
        }
        return preset;
    }

    async loadPreset(id: string): Promise<void> {
        const preset = await this.presetModel.findById(id).exec();
        if (!preset) {
            throw new NotFoundException(`Preset with id ${id} not found`);
        }

        const { configuration } = preset;

        // Update characters
        for (const [charId, charData] of Object.entries(configuration.characters)) {
            await this.characterModel.findOneAndUpdate(
                { id: charId },
                { $set: charData },
                { upsert: false }
            ).exec();
        }

        // Update cards
        for (const [cardId, cardData] of Object.entries(configuration.cards)) {
            await this.cardModel.findOneAndUpdate(
                { id: cardId },
                { $set: cardData },
                { upsert: false }
            ).exec();
        }

        // Update skills
        for (const [skillId, skillData] of Object.entries(configuration.skills)) {
            await this.skillModel.findOneAndUpdate(
                { id: skillId },
                { $set: skillData },
                { upsert: false }
            ).exec();
        }

        // Update balance
        if (configuration.balance) {
            const balance = await this.gameBalanceModel.findOne({ isActive: true }).exec();
            if (balance) {
                Object.assign(balance, configuration.balance);
                await balance.save();
            }
        }
    }

    async deletePreset(id: string): Promise<void> {
        const preset = await this.presetModel.findById(id).exec();
        if (!preset) {
            throw new NotFoundException(`Preset with id ${id} not found`);
        }
        preset.isActive = false;
        await preset.save();
    }

    async comparePresets(presetId1: string, presetId2: string): Promise<any> {
        const [preset1, preset2] = await Promise.all([
            this.presetModel.findById(presetId1).exec(),
            this.presetModel.findById(presetId2).exec(),
        ]);

        if (!preset1 || !preset2) {
            throw new NotFoundException('One or both presets not found');
        }

        // Compare configurations
        const differences = {
            characters: this.compareObjects(preset1.configuration.characters, preset2.configuration.characters),
            cards: this.compareObjects(preset1.configuration.cards, preset2.configuration.cards),
            skills: this.compareObjects(preset1.configuration.skills, preset2.configuration.skills),
            balance: this.compareObjects(preset1.configuration.balance, preset2.configuration.balance),
        };

        return {
            preset1: { id: preset1._id, name: preset1.name },
            preset2: { id: preset2._id, name: preset2.name },
            differences,
        };
    }

    private compareObjects(obj1: any, obj2: any): any {
        const differences: any = {};
        const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

        allKeys.forEach((key) => {
            const val1 = obj1?.[key];
            const val2 = obj2?.[key];

            if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                differences[key] = {
                    preset1: val1,
                    preset2: val2,
                };
            }
        });

        return differences;
    }
}

