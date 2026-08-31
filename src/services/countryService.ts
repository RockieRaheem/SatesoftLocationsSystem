import { Country } from '../../types';

const API_BASE_URL = '/api/countries';

export const countryService = {
  async getAllCountries(): Promise<Country[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch countries');
    return response.json();
  },

  async getCountryById(id: number): Promise<Country> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch country');
    return response.json();
  },

  async createCountry(country: Omit<Country, 'id'>): Promise<Country> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(country),
    });
    if (!response.ok) throw new Error('Failed to create country');
    return response.json();
  },

  async updateCountry(id: number, country: Country): Promise<Country> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(country),
    });
    if (!response.ok) throw new Error('Failed to update country');
    return response.json();
  },

  async deleteCountry(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete country');
  }
};
