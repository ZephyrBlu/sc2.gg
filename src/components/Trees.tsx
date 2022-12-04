import {Tree} from './Tree';
import './Builds.css';
import { Infobox } from './Infobox';

export function Trees({ trees }) {
  // const {raceBuildClusters, raceBuildTrees} = useBuilds();

  // useEffect(() => {
  //   const generateMatchups = () => {
  //     const matchups = RACES.map(outerRace => RACES.map(innerRace => {
  //       const matchup = [innerRace, outerRace];
  //       matchup.sort();
  //       return matchup.join(',');
  //     })).flat();
  //     return Array.from(new Set(matchups)).map(matchup => matchup.split(','));
  //   };

  //   const load = async () => {
  //     const raceClusters = await Promise.all(RACES.map(async (race) => {
  //       const results = await raceBuildClusters(race);
  //       return {[race]: results};
  //     }));

  //     let mappedClusters = {};
  //     raceClusters.forEach((cluster) => {
  //       mappedClusters = {
  //         ...mappedClusters,
  //         ...cluster,
  //       };
  //     });

  //     const raceTrees = await Promise.all(RACES.map(async (race) => {
  //       const results = await raceBuildTrees(race);
  //       return {[race]: results};
  //     }));

  //     let mappedTrees = {};
  //     raceTrees.forEach((tree) => {
  //       mappedTrees = {
  //         ...mappedTrees,
  //         ...tree,
  //       };
  //     });
  //     setClusters(mappedClusters);
  //     setTrees(mappedTrees);
  //   };

  //   load();
  // }, []);

  return (
    <div className="Builds">
      <Infobox>
        This page is not finished! The tree UI is very rough. Branches will be collapsed for readibility in future.
      </Infobox>
      {Object.entries(trees).map(([race, opponents]) => (
        <>
          <div className="Builds__race-builds">
            <div className="Builds__race-header">
              <h1 className="Builds__race">
                {race}
              </h1>
              <img
                src={`/icons/${race.toLowerCase()}-logo.svg`}
                className={`
                  Builds__race-icon
                  ${race.toLowerCase() === 'protoss' ? 'Builds__race-icon--protoss' : ''}
                `}
                alt={race}
              />
            </div>
            {Object.entries(opponents).map(([opponentRace, opponentTree]) => (
              <>
                <div className="Builds__opponent-race-builds">
                  <div className="Builds__race-header">
                    <h2 className="Builds__race">
                      vs {opponentRace}
                    </h2>
                    <img
                      src={`/icons/${opponentRace.toLowerCase()}-logo.svg`}
                      className={`
                        Builds__race-icon-opponent
                        ${opponentRace.toLowerCase() === 'protoss' ? 'Builds__race-icon-opponent--protoss' : ''}
                      `}
                      alt={opponentRace}
                    />
                  </div>
                  <details>
                    <summary>
                      Show build tree
                    </summary>
                    <Tree race={race} oppRace={opponentRace} tree={opponentTree} />
                  </details>
                </div>
                <hr className="Builds__cluster-divider" />                  
              </>
            ))}
          </div>
          <hr className="Builds__race-divider" />
        </>
      ))}
    </div>
  );
}
