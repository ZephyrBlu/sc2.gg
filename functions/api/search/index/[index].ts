import Toucan from 'toucan-js';

export const onRequest: PagesFunction<{
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
      params,
    } = context;

    const replayIndex = env.REPLAY_INDEX || env.REPLAY_INDEX_TEST;
    const replayData = env.REPLAYS || env.REPLAYS_TEST;

    const url = new URL(request.url);
    const urlParams = new URLSearchParams(url.search);

    let limit = 1000;
    if (urlParams.has('limit')) {
      limit = Number(urlParams.get('limit'));
    }

    // const prefixIndexes: {[prefix: string]: KVNamespaceListResult<unknown>['keys']} = {};
    // await Promise.all(PREFIXES.map(async (prefix) => {
    //   const index = await replayIndex.list({prefix: `${prefix}__`});
    //   prefixIndexes[prefix] = index.keys;
    // }));

    const index = await replayIndex.list({prefix: `${params.index}__`, limit});

    return new Response(JSON.stringify(index.keys.slice(0, 100)));
  } catch (e) {
    sentry.captureException(e);
    return new Response(`Something went wrong: ${e.toString()}`, {
      status: 500,
    });
  }
};
