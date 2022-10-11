export const onRequest: PagesFunction = async (context) => {
  const {
    request,
    env,
    params,
    waitUntil,
    next,
    data,
  } = context;

  return new Response("Hello world");
};
