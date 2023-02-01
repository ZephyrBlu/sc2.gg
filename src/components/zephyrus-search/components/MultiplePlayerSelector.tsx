import type {SelectorComponentProps} from '../types';
import './MultiplePlayerSelector.css';

export function MultiplePlayerSelector({identifier, children}: SelectorComponentProps) {
  return (
    <div className={`MultiplePlayerSelector ${identifier ? `MultiplePlayerSelector--${identifier}` : ''}`}>
      {children}
    </div>
  );
}
