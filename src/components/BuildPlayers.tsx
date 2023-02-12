import type {Race} from "./BlockResults";

interface Props {
  builds: Partial<Record<Race, any[]>>;
}

export function BuildPlayers({builds}: Props) {
  console.log('builds', builds);

  return (
    <div className="BuildPlayers">
      Build player stuff goes here
    </div>
  );
}
