import fetch from 'node-fetch';
import replayData from './public/data/replays.json' assert {type: "json"};

function deploy() {
  console.log(`[update_kv] updating KV store on ${process.env.CF_PAGES_BRANCH}`);

  if (
    !process.env.ACCOUNT_IDENTIFIER ||
    !process.env.NAMESPACE_IDENTIFIER ||
    !process.env.API_KEY
  ) {
    console.error('[update_kv] missing one of: ACCOUNT_IDENTIFIER, NAMESPACE_IDENTIFIER, API_KEY');
    console.log('[update_kv] ACCOUNT_IDENTIFIER:', process.env.ACCOUNT_IDENTIFIER);
    console.log('[update_kv] NAMSPACE_IDENTIFIER:', process.env.NAMESPACE_IDENTIFIER);
    console.log('[update_kv] API_KEY:', process.env.API_KEY);
    return;
  }

  const WORKERS_KV_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_IDENTIFIER}/storage/kv/namespaces/${process.env.NAMESPACE_IDENTIFIER}/bulk`;

  let replaysToSend = [];
  replayData.replays.forEach(async (replay) => {
    const {
      content_hash: contentHash,
      id,
      build_mappings,
      ...replayValue
    } = replay;
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
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replaysToSend),
      });

      if (res.status !== 200) {
        console.error(`[update_kv] KV PUT failed with status ${res.status}: ${res.statusText}`);
      }

      replaysToSend = [];
    }
  });
}

deploy();
