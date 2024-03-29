import {Build} from './Build';
import {Infobox} from './Infobox';
import './Builds.css';

export function Builds({ clusters }) {
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
  
  const calculateClusterPercentage = (clusterGroup) => {
    const topTenTotal = clusterGroup.clusters.reduce((total, cluster) => total + cluster.total, 0);
    return ((topTenTotal / clusterGroup.total) * 100).toFixed(0);
  };

  return (
    <div className="Builds">
      <Infobox>
        Builds in each matchup represent clusters of builds grouped by similarity.
        Common variations are the most common builds in the cluster, other than the main build.
      </Infobox>
      {Object.entries(clusters).map(([race, opponents]) => (
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
            {Object.entries(opponents).map(([opponentRace, opponentCluster]) => (
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
                  <div className="Builds__clusters-info">
                    {((opponentCluster.wins / opponentCluster.total) * 100).toFixed(1)}% win rate
                  </div>
                  <div className="Builds__clusters-info">
                    Top 10 includes {calculateClusterPercentage(opponentCluster)}% of games
                  </div>
                  <details>
                    <summary className="Builds__cluster-toggle">
                      Show Top 10 Builds
                    </summary>
                    {// opponentCluster.clusters.sort((a, b) => (b.wins / b.total) - (a.wins / a.total)) &&
                      opponentCluster.clusters.map((raceCluster) => (
                        <div className="Builds__cluster">
                          <Build
                            race={race}
                            build={{
                              total: raceCluster.build.total,
                              wins: raceCluster.build.wins,
                              losses: raceCluster.build.losses,
                            }}
                            matchup={{
                              total: opponentCluster.total,
                              wins: opponentCluster.wins,
                              losses: opponentCluster.losses,
                            }}
                            cluster={raceCluster}
                            buildings={raceCluster.build.build.split('__')[1].split(',')}
                          />
                        </div>
                      ))}
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
