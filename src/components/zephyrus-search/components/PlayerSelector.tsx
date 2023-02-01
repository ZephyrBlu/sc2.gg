import type {SelectorComponentProps} from '../types';
import './PlayerSelector.css';

export function PlayerSelector({children}: SelectorComponentProps) {
  return (
    <div className="PlayerSelector">
      {children}
    </div>
  );
}