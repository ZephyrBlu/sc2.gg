import type {SelectorComponentProps} from '../types';
import './PlayerSelector.css';

export function PlayerSelector({identifier, children}: SelectorComponentProps) {
  return (
    <div className={`PlayerSelector ${identifier ? `PlayerSelector--${identifier}`: ''}`}>
      {children}
    </div>
  );
}
