import type {SelectorComponentProps} from '../types';
import './ZephyrusMultipleSelector.css';

export function ZephyrusMultipleSelector({identifier, children}: SelectorComponentProps) {
  return (
    <div className={`ZephyrusMultipleSelector ${identifier ? `ZephyrusMultipleSelector--${identifier}` : ''}`}>
      {children}
    </div>
  );
}
