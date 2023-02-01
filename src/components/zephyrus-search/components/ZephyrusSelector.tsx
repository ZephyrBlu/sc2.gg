import type {SelectorComponentProps} from '../types';
import './ZephyrusSelectorType.css';

export function ZephyrusSelector({identifier, children}: SelectorComponentProps) {
  return (
    <div className={`ZephyrusSelector ${identifier ? `ZephyrusSelector--${identifier}` : ''}`}>
      {children}
    </div>
  );
}
