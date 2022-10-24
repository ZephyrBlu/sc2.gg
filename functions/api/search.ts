import {PREFIXES} from '../../constants';
import Toucan from 'toucan-js';

export const onRequest: PagesFunction<{
  CF_PAGES_BRANCH: string,
  REPLAYS: KVNamespace,
  REPLAYS_TEST: KVNamespace,
  REPLAY_INDEX: KVNamespace,
  REPLAY_INDEX_TEST: KVNamespace,
}> = async (context) => {
  const sentry = new Toucan({
    dsn: 'https://897e41e5e6f24829b75be219387dff94@o299086.ingest.sentry.io/4504037385240576',
    context, // Includes 'waitUntil', which is essential for Sentry logs to be delivered. Also includes 'request' -- no need to set it separately.
    allowedHeaders: ['user-agent'],
    allowedSearchParams: /(.*)/,
  });

  try {
    const {
      request,
      env,
    } = context;

    const replayIndex = env.REPLAY_INDEX || env.REPLAY_INDEX_TEST;
    const replayData = env.REPLAYS || env.REPLAYS_TEST;

    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);

    if (!urlParams.has('q')) {
      return new Response('No query string param ?q=', {
        status: 400,
      });
    }

    const query = urlParams.get('q');

    // limit to 5 terms
    const searchTerms = query.split(' ').slice(0, 5);

    // get list of keys for each index category, then search index
    const rawPostingLists = await Promise.all(PREFIXES.map(async (prefix) => {
      const index = await replayIndex.list({prefix: `${prefix}__`});

      // find the keys in the index that contain at least one search term
      const matchingIndexKeys = index.keys.filter((key) => (
        searchTerms.some((term) => key.name.includes(term)))
      );

      sentry.captureMessage(`Matching index keys with search terns ${JSON.stringify(searchTerms)}: ${JSON.stringify(matchingIndexKeys)}`);

      const indexResults = await Promise.all(matchingIndexKeys.map(async (key) => {
        const references = await replayIndex.get(key.name);
        sentry.captureMessage(`References for ${key.name} index: ${references}`);
        return JSON.parse(references);
      }));

      return indexResults;
    }));

    // flatten list of lists, then remove duplicates
    const postingList = Array.from(new Set(rawPostingLists.flat()));

    sentry.captureMessage(`postingList: ${JSON.stringify(postingList)}`);

    // const rawPostingLists: string[][] = await Promise.all(searchTerms.map(async (term) => {
    //   const references = await replayIndex.get(term);
    //   return JSON.parse(references);
    // }));
    // const postingList = rawPostingLists.flat();

    /*
      currently the hash for replays is a simple content hash
      this is unsuitable for >1000 search results since they will be unordered
      if this becomes a problem the has can be altered to include a timestamp
      which can be used for sorting
    */

    // max requests to other services is 1000
    const replays = await Promise.all(postingList.slice(0, 995).map(async (replayId) => {
      const replay = await replayData.get(replayId);
      return replay;
    }));

    sentry.captureMessage(`replays: ${JSON.stringify(replays)}`);

    return new Response(JSON.stringify(replays));
  } catch (e) {
    sentry.captureException(e);
    return new Response(`Something went wrong: ${e.toString()}`, {
      status: 500,
    });
  }
};
