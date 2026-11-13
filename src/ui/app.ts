import { createSearchController, type SearchState } from '../searchController.js';
import type { CountryCard } from '../countries/types.js';
import { createElement } from './createElement.js';
import { ERROR_MESSAGES, TEXTS } from './texts.js';
import { createCard, showDetails } from './views.js';

const DEBOUNCE_MS = 300;

interface Handlers {
  onRetry: () => void;
  onSelect: (country: CountryCard) => void;
}

function buildContent(state: SearchState, handlers: Handlers): Node[] {
  switch (state.status) {
    case 'idle':
      return [];
    case 'loading':
      return [createElement('div', 'loading', TEXTS.LOADING)];
    case 'empty':
      return [createElement('div', 'empty', TEXTS.NOT_FOUND)];
    case 'error': {
      const retryButton = createElement('button', 'retry-btn', TEXTS.RETRY);
      retryButton.addEventListener('click', handlers.onRetry);
      return [createElement('div', 'error', createElement('p', '', ERROR_MESSAGES[state.kind]), retryButton)];
    }
    case 'success':
      return [
        createElement('div', 'cards-list', ...state.countries.map((country) => createCard(country, handlers.onSelect))),
      ];
  }
}

export function mountApp(root: HTMLElement): void {
  const input = createElement('input', 'search-input');
  input.type = 'search';
  input.placeholder = TEXTS.PLACEHOLDER;

  const content = createElement('div', 'content');
  root.append(
    createElement('h1', 'title', TEXTS.TITLE),
    createElement('p', 'subtitle', TEXTS.DESCRIPTION),
    input,
    content,
  );

  const controller = createSearchController({
    debounceMs: DEBOUNCE_MS,
    onStateChange: (state) => render(state),
  });

  const handlers: Handlers = {
    onRetry: () => controller.retry(),
    onSelect: (country) => {
      const details = controller.getDetails(country.name);
      if (details) {
        showDetails(country, details);
      }
    },
  };

  const render = (state: SearchState): void => {
    content.replaceChildren(...buildContent(state, handlers));
  };

  input.addEventListener('input', () => controller.handleInput(input.value));
  render(controller.getState());
}
