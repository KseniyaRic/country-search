import { describe, test, expect } from 'vitest';
import italy from './fixtures/italy.json';
import united from './fixtures/united.json';
import { mapCountryResponse } from '../src/countries/mapCountryResponse.js';

describe('mapCountryResponse', () => {
  test('возвращает карточку со всеми полями для обычной страны', () => {
    const cards = mapCountryResponse(italy);

    expect(cards).toEqual([
      {
        name: 'Italy',
        flagUrl: 'https://flagcdn.com/it.svg',
        capital: 'Rome',
        region: 'Europe',
        population: 59554023,
        languages: ['Italian'],
      },
    ]);
  });
  test('возвращает пустой массив, если стран в ответе нет', () => {
    expect(mapCountryResponse([])).toEqual([]);
  });

  test('возвращает по карточке на каждую страну в прежнем порядке', () => {
    const cards = mapCountryResponse(united);

    expect(cards).toHaveLength(united.length);
    expect(cards.map((card) => card.name)).toEqual(united.map((country) => country.name));
  });

  test('возвращает null вместо столицы для страны без столицы', () => {
    const cards = mapCountryResponse(united);
    const card = cards.find((item) => item.name === 'United States Minor Outlying Islands');

    expect(card?.capital).toBeNull();
  });

  test('возвращает названия всех языков строками, если их несколько', () => {
    const cards = mapCountryResponse(united);
    const card = cards.find((item) => item.name === 'Tanzania, United Republic of');

    expect(card?.languages).toEqual(['Swahili', 'English']);
  });
});
