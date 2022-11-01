import Toucan from 'toucan-js';

export const onRequest: PagesFunction<{
  REPLAYS: KVNamespace,
  REPLAYS_TEST: KVNamespace,
  REPLAY_INDEX: KVNamespace,
  REPLAY_INDEX_TEST: KVNamespace,
  CACHED_RESULTS: KVNamespace,
  CACHED_RESULTS_TEST: KVNamespace,
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
      params,
    } = context;

    const replayIndex = env.REPLAY_INDEX || env.REPLAY_INDEX_TEST;
    const replayData = env.REPLAYS || env.REPLAYS_TEST;
    const computedQueries = env.CACHED_RESULTS || env.CACHED_RESULTS_TEST;

    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);

    if (!urlParams.has('q')) {
      return new Response('No query string param ?q=', {
        status: 400,
      });
    }

    const query = urlParams.get('q');

    const sortedSearchTerms = query.split(' ');
    sortedSearchTerms.sort();

    const queryResultsKey = sortedSearchTerms.join('__');
    const cachedQueryResults = await computedQueries.get(queryResultsKey);
    if (cachedQueryResults) {
      return new Response(cachedQueryResults);
    }

    // limit to 5 terms
    const searchTerms = query.split(' ').slice(0, 5);

    const index = await replayIndex.list({prefix: `${params.index}__`});

    // get list of keys for each index category, then search index
    const rawPostingLists = await Promise.all(searchTerms.map(async (term) => {
      // find the keys in the index that contain the search term
      let matchingTermKeys = index.keys.filter((entry) => entry.name.includes(term));

      // de-dupe references from across multiple indexes
      matchingTermKeys = Array.from(new Set(matchingTermKeys));

      const indexResults = await Promise.all(
        matchingTermKeys.map(async (key) => (
          replayIndex
            .get(key.name, {type: 'json'})
            .catch(e => sentry.captureException(e))
        ))
      );
      return indexResults.flat();
    }));

    // https://stackoverflow.com/a/1885569
    // progressively applying this intersection logic to each search term results, creates intersection of all terms
    // this is likely the most computationally intensive part of the search
    const postingList = rawPostingLists.reduce((current, next) => {
      return current.filter(value => next.includes(value))
    }, rawPostingLists[0]);

    /*
      currently the hash for replays is a simple content hash
      this is unsuitable for >1000 search results since they will be unordered
      if this becomes a problem the has can be altered to include a timestamp
      which can be used for sorting
    */

    // max requests to other services is 1000
    const replays = await Promise.all(postingList.slice(0, 100).map(async (replayId) => {
      const replay = await replayData
        .get(replayId as string, {type: 'json'})
        .catch((e) => sentry.captureException(e));
      return replay;
    }));

    return new Response(JSON.stringify(replays), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    sentry.captureException(e);
    return new Response(e.toString(), {
      status: 500,
    });
  }
};
