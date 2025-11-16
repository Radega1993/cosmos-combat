import { create } from 'zustand';
import { Character } from '../types/game.types';

interface GameState {
    characters: Character[];
    selectedCharacter: Character | null;
    hand: any[];
    deck: any[];
    discard: any[];
    hp: number;
    maxHp: number;
    setCharacters: (characters: Character[]) => void;
    setSelectedCharacter: (character: Character | null) => void;
    setHand: (hand: any[]) => void;
    setDeck: (deck: any[]) => void;
    setDiscard: (discard: any[]) => void;
    setHp: (hp: number) => void;
    setMaxHp: (maxHp: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
    characters: [],
    selectedCharacter: null,
    hand: [],
    deck: [],
    discard: [],
    hp: 0,
    maxHp: 0,
    setCharacters: (characters) => set({ characters }),
    setSelectedCharacter: (character) => set({ selectedCharacter: character }),
    setHand: (hand) => set({ hand }),
    setDeck: (deck) => set({ deck }),
    setDiscard: (discard) => set({ discard }),
    setHp: (hp) => set({ hp }),
    setMaxHp: (maxHp) => set({ maxHp }),
}));

