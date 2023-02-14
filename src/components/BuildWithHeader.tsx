import type { Race } from "./BlockResults";
import './Tree.css';

interface Props {
  winrate: number;
  playrate: number;
  total: number;
  build: string[];
  race: Race;
}

export function BuildWithHeader({ winrate, playrate, total, build, race }: Props) {
  return (
    <div className="Tree Tree--grouped">
      <div className="Tree__header">
        <div className="Tree__modifiers Tree__modifiers--secondary">
          <div className="Tree__modifier Tree__modifier--secondary">
            {winrate}% winrate
          </div>
          <div className="Tree__modifier Tree__modifier--secondary">
            {playrate}% playrate
          </div>
          <div className="Tree__modifier Tree__modifier--secondary">
            {total} games
          </div>
        </div>
      </div>
      <div className="Tree__prefix">
        {build.map((building, index) => (
          <div className="Tree__building">
            <img
              alt={building}
              title={building}
              className="Tree__building-icon"
              src={`/images/buildings/${race}/${building}.png`}
            />
            {build.length - 1 !== index &&
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="Tree__arrow"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>}
          </div>
        ))}
      </div>
    </div>
  );
}
