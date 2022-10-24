import fetch from 'node-fetch';
import replayData from './public/data/replays.json' assert {type: "json"};

// don't update KV for non-production deploys
if (env.CF_PAGES_BRANCH !== 'master') {
  return;
}

if (
  !env.ACCOUNT_IDENTIFIER ||
  !env.NAMESPACE_IDENTIFIER ||
  !env.API_KEY
) {
  console.error('Missing one of: ACCOUNT_IDENTIFIER, NAMESPACE_IDENTIFIER, API_KEY');
  console.log('ACCOUNT_IDENTIFIER:', env.ACCOUNT_IDENTIFIER);
  console.log('NAMSPACE_IDENTIFIER:', env.NAMESPACE_IDENTIFIER);
  console.log('API_KEY:', env.API_KEY);
  return;
}

const WORKERS_KV_URL = `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_IDENTIFIER}/storage/kv/namespaces/${env.NAMESPACE_IDENTIFIER}/bulk`;

let replaysToSend = [];
replayData.replays.forEach(async (replay) => {
  const {content_hash: contentHash, ...replayValue} = replay;
  const kvData = {
    key: contentHash,
    value: JSON.stringify(replayValue),
  };
  replaysToSend.push(kvData);

  if (
    replaysToSend.length === 10000 ||
    replaysToSend.length === replayData.replays.length
  ) {
    const res = await fetch(WORKERS_KV_URL, {
      method: 'PUT',
      headers: new Headers({
        'Authorization': `Bearer ${env.API_KEY}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(replaysToSend),
    });

    if (res.status !== 200) {
      console.error(`KV PUT failed with status ${res.status}: ${res.statusText}`);
    }

    replaysToSend = [];
  }
});
