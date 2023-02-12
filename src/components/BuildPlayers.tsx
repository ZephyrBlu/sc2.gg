import type {Race} from "./BlockResults";

interface Props {
  builds: Record<Race, string[]>;
}

export function BuildPlayers({builds}: Props) {
  return (
    <div className="BuildPlayers">
      Build player stuff goes here
    </div>
  );
}
