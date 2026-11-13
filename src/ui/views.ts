import type { CountryCard, CountryDetails } from '../countries/types.js';
import { createElement } from './createElement.js';
import { TEXTS } from './texts.js';

const formatNumber = (value: number): string => value.toLocaleString('en-US');
const formatList = (items: string[]): string => (items.length > 0 ? items.join(', ') : TEXTS.NO_INFO);

export function createCard(country: CountryCard, onSelect: (country: CountryCard) => void): HTMLElement {
  const flag = createElement('img', 'flag');
  flag.src = country.flagUrl;
  flag.alt = `Flag of ${country.name}`;

  const card = createElement(
    'div',
    'country-card',
    flag,
    createElement('h3', '', country.name),
    createElement('p', '', `Capital: ${country.capital ?? TEXTS.NO_INFO}`),
    createElement('p', '', `Region: ${country.region}`),
    createElement('p', '', `Population: ${formatNumber(country.population)}`),
  );
  card.addEventListener('click', () => onSelect(country));
  return card;
}

export function showDetails(country: CountryCard, details: CountryDetails): void {
  const modal = createElement('div', 'modal');

  const closeButton = createElement('button', 'close-btn', '×');
  closeButton.addEventListener('click', () => modal.remove());

  const area = details.area === null ? TEXTS.NO_INFO : `${formatNumber(details.area)} km²`;
  const lines = [
    `${country.name} is a country in ${country.region}. Capital: ${country.capital ?? TEXTS.NO_INFO}.`,
    `Area: ${area}`,
    `Borders: ${formatList(details.borders)}`,
    `Languages: ${formatList(country.languages)}`,
    `Currency: ${formatList(details.currencies)}`,
  ].map((text) => createElement('p', '', text));

  modal.append(createElement('div', 'modal-content', closeButton, createElement('h2', '', country.name), ...lines));
  document.body.append(modal);
}
