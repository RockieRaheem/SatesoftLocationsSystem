import type { Country } from '../../types.ts';
import { apiFetch } from './api.ts';

const API_BASE_URL = '/api/countries';

export const countryService = {
  async getAllCountries(): Promise<Country[]> {
    const response = await apiFetch(API_BASE_URL);
    return response.json();
  },

  async getCountryById(id: number): Promise<Country> {
    const response = await apiFetch(`${API_BASE_URL}/${id}`);
    return response.json();
  },

  async createCountry(country: Omit<Country, 'id'>): Promise<Country> {
    const response = await apiFetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(country),
    });
    return response.json();
  },

  async updateCountry(id: number, country: Country): Promise<Country> {
    const response = await apiFetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(country),
    });
    return response.json();
  },

  async deleteCountry(id: number): Promise<void> {
    await apiFetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  }
};
