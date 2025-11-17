const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
    private authToken: string | null = null;

    setAuthToken(token: string | null) {
        this.authToken = token;
    }

    private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options?.headers as Record<string, string> || {}),
        };

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null as T;
            }
            if (response.status === 401) {
                // Unauthorized - clear token
                this.authToken = null;
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
            const errorText = await response.text();
            let errorMessage = `API Error: ${response.statusText}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch {
                // Use default error message
            }
            throw new Error(errorMessage);
        }

        // Check if response has content
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return null as T;
        }

        const text = await response.text();
        if (!text || text.trim() === '') {
            return null as T;
        }

        try {
            return JSON.parse(text);
        } catch (error) {
            console.error(`Failed to parse JSON from ${endpoint}:`, text);
            return null as T;
        }
    }

    // Characters
    async getCharacters() {
        return this.fetch<any[]>('/characters');
    }

    async getCharacter(id: string) {
        return this.fetch<any>(`/characters/${id}`);
    }

    // Cards
    async getCards(type?: string) {
        const url = type ? `/cards?type=${type}` : '/cards';
        return this.fetch<any[]>(url);
    }

    async getCard(id: string) {
        return this.fetch<any>(`/cards/${id}`);
    }

    async getCardsByIds(ids: string[]) {
        // Use batch endpoint for better performance
        try {
            if (!ids || ids.length === 0) {
                return [];
            }
            const idsParam = ids.join(',');
            // includeInactive=true by default because players may have inactive cards in hand
            const cards = await this.fetch<any[]>(`/cards/batch?ids=${idsParam}&includeInactive=true`);
            return cards || [];
        } catch (error) {
            console.error('Error fetching cards by IDs:', error);
            // Fallback to individual requests
            try {
                const cards = await Promise.all(
                    ids.map((id) => this.getCard(id))
                );
                return cards.filter((card) => card !== null);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                return [];
            }
        }
    }

    // Skills
    async getSkills(characterId?: string) {
        const url = characterId ? `/skills?character=${characterId}` : '/skills';
        return this.fetch<any[]>(url);
    }

    async getSkill(id: string) {
        return this.fetch<any>(`/skills/${id}`);
    }

    async getSkillsByIds(ids: string[]) {
        try {
            if (!ids || ids.length === 0) {
                return [];
            }
            const idsParam = ids.join(',');
            const skills = await this.fetch<any[]>(`/skills/batch?ids=${idsParam}`);
            return skills || [];
        } catch (error) {
            console.error('Error fetching skills by IDs:', error);
            // Fallback to individual requests
            try {
                const skills = await Promise.all(
                    ids.map((id) => this.getSkill(id))
                );
                return skills.filter((skill) => skill !== null);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                return [];
            }
        }
    }

    // Auth
    async login(username: string, password: string) {
        return this.fetch<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    async register(username: string, email: string, password: string) {
        const body: any = { username, password };
        if (email && email.trim()) {
            body.email = email;
        }
        return this.fetch<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async getCurrentUser() {
        return this.fetch<{ userId: string; username: string; role: string }>('/auth/me');
    }

    // Admin
    async updateSkill(skillId: string, updateData: any) {
        return this.fetch<any>(`/admin/skills/${skillId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    async toggleSkillActive(skillId: string) {
        return this.fetch<any>(`/admin/skills/${skillId}/toggle`, {
            method: 'PUT',
        });
    }

    async updateCard(cardId: string, updateData: any) {
        return this.fetch<any>(`/admin/cards/${cardId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    async toggleCardActive(cardId: string) {
        return this.fetch<any>(`/admin/cards/${cardId}/toggle`, {
            method: 'PUT',
        });
    }

    async updateCharacter(characterId: string, updateData: any) {
        return this.fetch<any>(`/admin/characters/${characterId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    async toggleCharacterActive(characterId: string) {
        return this.fetch<any>(`/admin/characters/${characterId}/toggle`, {
            method: 'PUT',
        });
    }

    // Images
    async getCardImages() {
        return this.fetch<string[]>('/admin/images/cards');
    }

    async getCharacterImages() {
        return this.fetch<string[]>('/admin/images/characters');
    }

    // Admin endpoints (including inactive items)
    async getAdminCharacters() {
        return this.fetch<any[]>('/admin/characters');
    }

    async getAdminCards() {
        return this.fetch<any[]>('/admin/cards');
    }

    async getAdminSkills() {
        return this.fetch<any[]>('/admin/skills');
    }

    // Game Balance
    async getGameBalance() {
        return this.fetch<any>('/admin/balance');
    }

    async updateGameBalance(data: any) {
        return this.fetch<any>('/admin/balance', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Presets
    async createPreset(name: string, description?: string) {
        return this.fetch<any>('/admin/presets', {
            method: 'POST',
            body: JSON.stringify({ name, description }),
        });
    }

    // Analytics
    async getCharacterWinRates(balanceVersion?: string, startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (balanceVersion) params.append('balanceVersion', balanceVersion);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.fetch<any[]>(`/analytics/character-win-rates?${params.toString()}`);
    }

    async getCardUsage(balanceVersion?: string, startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (balanceVersion) params.append('balanceVersion', balanceVersion);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.fetch<any[]>(`/analytics/card-usage?${params.toString()}`);
    }

    async getGameDurations(balanceVersion?: string, startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (balanceVersion) params.append('balanceVersion', balanceVersion);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.fetch<any>(`/analytics/game-durations?${params.toString()}`);
    }

    async getPlayerStats(playerId?: string, startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (playerId) params.append('playerId', playerId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.fetch<any[]>(`/analytics/player-stats?${params.toString()}`);
    }

    async getOverallStats(balanceVersion?: string, startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (balanceVersion) params.append('balanceVersion', balanceVersion);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.fetch<any>(`/analytics/overall-stats?${params.toString()}`);
    }

    async exportData(format: 'json' | 'csv' = 'json', balanceVersion?: string, startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        params.append('format', format);
        if (balanceVersion) params.append('balanceVersion', balanceVersion);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.fetch<any>(`/analytics/export?${params.toString()}`);
    }

    async getPresets() {
        return this.fetch<any[]>('/admin/presets');
    }

    async getPreset(id: string) {
        return this.fetch<any>(`/admin/presets/${id}`);
    }

    async loadPreset(id: string) {
        return this.fetch<any>(`/admin/presets/${id}/load`, {
            method: 'POST',
        });
    }

    async deletePreset(id: string) {
        return this.fetch<any>(`/admin/presets/${id}`, {
            method: 'DELETE',
        });
    }

    async comparePresets(presetId1: string, presetId2: string) {
        return this.fetch<any>('/admin/presets/compare', {
            method: 'POST',
            body: JSON.stringify({ presetId1, presetId2 }),
        });
    }
}

export const apiService = new ApiService();

