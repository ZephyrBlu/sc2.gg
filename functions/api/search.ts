export const onRequest: PagesFunction<{
  CF_PAGES_BRANCH: string,
  REPLAYS: KVNamespace,
  REPLAYS_TEST: KVNamespace,
  REPLAY_INDEX: KVNamespace,
  REPLAY_INDEX_TEST: KVNamespace,
}> = async (context) => {
  const {
    request,
    env,
  } = context;

  const replayIndex = env.CF_PAGES_BRANCH === 'master'
    ? env.REPLAY_INDEX
    : env.REPLAY_INDEX_TEST;
  const replayData = env.CF_PAGES_BRANCH === 'master'
    ? env.REPLAYS
    : env.REPLAYS_TEST;

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

  const rawPostingLists: string[][] = await Promise.all(searchTerms.map(async (term) => {
    const references = await replayIndex.get(term);
    return JSON.parse(references);
  }));
  const postingList = rawPostingLists.flat();

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

  return new Response(JSON.stringify(replays));
};
