import {escapeInject, dangerouslySkipEscape, PageContextBuiltIn} from 'vite-plugin-ssr';
import type {Replay} from '../src/types';
import replayData from '../public/data/replays.json';
import buildData from '../public/data/builds.json';
import styles from '../components/index.css';

export async function render(pageContext: PageContextBuiltIn) {
  let initialReplayData = replayData.replays;
  const playedAtSort = (a: Replay, b: Replay) => b.played_at - a.played_at;
  initialReplayData.sort(playedAtSort);

  // @ts-ignore:next-line
  initialReplayData = initialReplayData.map((replay: Replay) => {
    replay.builds = replay.build_mappings.map((build) => buildData[build]);
    return replay;
  });

  return escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
       <style>${dangerouslySkipEscape(styles)}</style>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
    
        <title>StarCraft 2 Tournament Games</title>
      </head>
      <body>
        <div
          id="root"
          ${pageContext.urlPathname === '/'
            ? `data-replays=${Buffer.from(JSON.stringify(initialReplayData.slice(0, 100))).toString('base64')}`
            : ''}
        >
        </div>
      </body>
    </html>`;
}
