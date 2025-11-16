import { create } from 'zustand';
import { GameSession, Player } from '../types/game.types';

interface LobbyState {
    currentGame: GameSession | null;
    currentPlayerId: string | null;
    availableGames: GameSession[];
    error: string | null;
    setCurrentGame: (game: GameSession | null | ((prev: GameSession | null) => GameSession | null)) => void;
    setCurrentPlayerId: (playerId: string | null) => void;
    setAvailableGames: (games: GameSession[]) => void;
    setError: (error: string | null) => void;
    updateGame: (game: GameSession) => void;
    addPlayer: (player: Player) => void;
    removePlayer: (playerId: string) => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
    currentGame: null,
    currentPlayerId: null,
    availableGames: [],
    error: null,
    setCurrentGame: (game) => set((state) => ({
        currentGame: typeof game === 'function' ? game(state.currentGame) : game
    })),
    setCurrentPlayerId: (playerId) => set({ currentPlayerId: playerId }),
    setAvailableGames: (games) => set({ availableGames: games }),
    setError: (error) => set({ error }),
    updateGame: (game) => set({ currentGame: game }),
    addPlayer: (player) =>
        set((state) => {
            if (!state.currentGame) return state;
            return {
                currentGame: {
                    ...state.currentGame,
                    players: [...state.currentGame.players, player],
                },
            };
        }),
    removePlayer: (playerId) =>
        set((state) => {
            if (!state.currentGame) return state;
            return {
                currentGame: {
                    ...state.currentGame,
                    players: state.currentGame.players.filter((p) => p.playerId !== playerId),
                },
            };
        }),
}));

