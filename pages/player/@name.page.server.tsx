import {players} from '../../constants';

export async function prerender() {
  return players.map(player => `/player/${player}`);
}
