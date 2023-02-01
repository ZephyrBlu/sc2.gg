import type {SelectorComponentProps} from '../types';
import './ZephyruSelector.css';

export function ZephyruSelector({identifier, children}: SelectorComponentProps) {
  return (
    <div className={`ZephyrusSelector ${identifier ? `ZephyrusSelector--${identifier}` : ''}`}>
      {children}
    </div>
  );
}
