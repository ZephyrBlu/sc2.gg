import fetch from 'node-fetch';
import replayData from './public/data/replays.json' assert {type: "json"};
import indexData from './public/data/indexes.json' assert {type: "json"};
import computedResults from './public/data/computed.json' assert {type: "json"};

async function writeToKV(url, data) {
  console.log(`[update_kv] writing ${data.length} records to ${url}`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (res.status !== 200) {
    const body = await res.json();
    console.log(`[update_kv] KV PUT failed with status ${res.status}: ${res.statusText}`);
    console.log(`[update_kv] response: ${JSON.stringify(body)}`);
  }
}

async function updateComputedResults(url) {
  console.log('[update_kv] updating computed search results');

  let computedResultsToSend = [];
  Object.entries(computedResults).forEach(async ([key, references]) => {
    const kvData = {
      key,
      value: JSON.stringify(references),
    };
    computedResultsToSend.push(kvData);

    if (computedResultsToSend.length === 10000) {
      await writeToKV(url, computedResultsToSend);
    }
  });

  if (computedResultsToSend.length > 0) {
    await writeToKV(url, computedResultsToSend);
  }
}

async function updateIndex(url) {
  console.log('[update_kv] updating replay index');

  let indexesToSend = [];
  Object.entries(indexData).forEach(([category, keys]) => {
    Object.entries(keys).forEach(async ([key, references]) => {
      const kvData = {
        key: `${category}__${key}`,
        value: JSON.stringify(references),
        metadata: JSON.stringify({context: category}),
      };
      indexesToSend.push(kvData);

      if (indexesToSend.length === 10000) {
        await writeToKV(url, indexesToSend);
      }
    });
  });

  if (indexesToSend.length > 0) {
    await writeToKV(url, indexesToSend);
  }

  console.log('[update_kv] finished updating replay index');
}

async function updateReplays(url) {
  console.log('[update_kv] updating replay data');

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
      metadata: JSON.stringify(replayValue),
    };
    replaysToSend.push(kvData);

    if (replaysToSend.length === 10000) {
      await writeToKV(url, replaysToSend);
    }
  });

  if (replaysToSend.length > 0) {
    await writeToKV(url, replaysToSend);
  }

  console.log('[update_kv] finished updating replay data');
}

async function update() {
  console.log(`[update_kv] updating KV store on ${process.env.CF_PAGES_BRANCH}`);

  if (
    !process.env.ACCOUNT_IDENTIFIER ||
    !process.env.REPLAYS_NAMESPACE_IDENTIFIER ||
    !process.env.REPLAY_INDEX_NAMESPACE_IDENTIFIER ||
    !process.env.COMPUTED_RESULTS_IDENTIFIER ||
    !process.env.API_KEY
  ) {
    console.error('[update_kv] missing one of: ACCOUNT_IDENTIFIER, REPLAYS_NAMESPACE_IDENTIFIER, REPLAY_INDEX_NAMESPACE_IDENTIFIER, API_KEY');
    console.log('[update_kv] ACCOUNT_IDENTIFIER:', process.env.ACCOUNT_IDENTIFIER);
    console.log('[update_kv] REPLAYS_NAMESPACE_IDENTIFIER:', process.env.REPLAYS_NAMESPACE_IDENTIFIER);
    console.log('[update_kv] REPLAY_INDEX_NAMESPACE_IDENTIFIER:', process.env.REPLAY_INDEX_NAMESPACE_IDENTIFIER);
    console.log('[update_kv] COMPUTED_RESULTS_IDENTIFIER:', process.env.COMPUTED_RESULTS_IDENTIFIER);
    console.log('[update_kv] API_KEY:', process.env.API_KEY);
    return;
  }
  
  const REPLAY_INDEX_KV_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_IDENTIFIER}/storage/kv/namespaces/${process.env.REPLAY_INDEX_NAMESPACE_IDENTIFIER}/bulk`;
  const REPLAYS_KV_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_IDENTIFIER}/storage/kv/namespaces/${process.env.REPLAYS_NAMESPACE_IDENTIFIER}/bulk`;
  const COMPUTED_RESULTS_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_IDENTIFIER}/storage/kv/namespaces/${process.env.COMPUTED_RESULTS_IDENTIFIER}/bulk`;

  await updateIndex(REPLAY_INDEX_KV_URL);
  await updateReplays(REPLAYS_KV_URL);
  await updateComputedResults(COMPUTED_RESULTS_URL);

  console.log(`[update_kv] updated KV data for ${replayData.replays.length} replays`);
}

await update();
