import type {Race} from "./BlockResults";
import './Player.css';

interface Props {
  name: string;
  race: Race;
  size: 'small' | 'medium' | 'large';
}

export function Player({name, race, size = 'small'}: Props) {
  return (
    <div className={`Player Player--${size}`}>
      <img
        className="Player__icon"
        src={`/icons/${race.toLowerCase()}-logo.svg`}
        alt={race}
      />
      <span className="Player__name">
        {name}
      </span>
    </div>
  );
}
