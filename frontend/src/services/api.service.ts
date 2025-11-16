const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
    private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null as T;
            }
            throw new Error(`API Error: ${response.statusText}`);
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
            const cards = await this.fetch<any[]>(`/cards/batch?ids=${idsParam}`);
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
}

export const apiService = new ApiService();

