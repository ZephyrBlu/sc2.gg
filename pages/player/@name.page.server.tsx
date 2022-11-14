import {PLAYERS} from '../../constants';

export async function prerender() {
  return PLAYERS.map(player => `/player/${player}`);
}
