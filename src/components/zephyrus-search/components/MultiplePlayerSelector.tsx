import type {SelectorComponentProps} from '../types';
import './MultiplePlayerSelector.css';

export function MultiplePlayerSelector({children}: SelectorComponentProps) {
  return (
    <div className="MultiplePlayerSelector">
      {children}
    </div>
  );
}
