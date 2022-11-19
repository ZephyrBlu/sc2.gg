import './Build.css';

export function Build({ race, matchup, cluster, buildings }: {
  race: string,
  matchup: {
    total: number,
    wins: number,
    losses: number,
  },
  build: {
    total: number,
    wins: number,
    losses: number,
  },
  cluster: any[],
  buildings: string[],
}) {
  return (
    <div className="Build">
      <div className="Build__build">
          <div className="Build__buildings">
            {buildings.map((building) => (
              <div className="Build__building">
                <img
                  alt={building}
                  title={building}
                  className="Build__building-icon"
                  src={`/images/buildings/${race}/${building}.png`}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="Build__arrow-right">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </div>
            ))}
          </div>
          <span className="Build__stats">
            {((cluster.wins / cluster.total) * 100).toFixed(1)}% win rate, {((cluster.total / matchup.total) * 100).toFixed(0)}% of matchup games
          </span>
        </div>
      <details className="Build__cluster-container">
        <summary className="Build__cluster-toggle">
          Most common variations
        </summary>
        <div className="Build__build Build__build--cluster">
          {cluster.cluster.map((build) => (
            <>
              <div className="Build__buildings Build__buildings--cluster">
                {build.build.split('__')[1].split(',').map((building) => (
                  <div className="Build__building">
                    <img
                      alt={building}
                      title={building}
                      className="Build__building-icon"
                      src={`/images/buildings/${race}/${building}.png`}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="Build__arrow-right">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </div>
                ))}
              </div>
              {/* <span className="Build__stats">
                {((build.wins / build.total) * 100).toFixed(1)}% win rate, {((build.total / cluster.total) * 100).toFixed(0)}% of cluster games
              </span> */}
            </>
          ))}
        </div>
      </details>
    </div>
  );
}
