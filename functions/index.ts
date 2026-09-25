/* One address for the site: www.hiabhi.com sends you to hiabhi.com.

   Google should see one homepage, not two copies of it. The Cloudflare
   token for this project cannot write zone redirect rules, and a Pages
   _redirects file cannot match on the host name, so this function does it.

   It runs on the homepage path only (see _routes.json). Every other
   request, and every request to hiabhi.com itself, is served straight
   from the static files, exactly as before. */

interface Context {
  request: Request;
  next: () => Promise<Response>;
}

export const onRequest = async ({ request, next }: Context): Promise<Response> => {
  const url = new URL(request.url);
  if (url.hostname === "www.hiabhi.com") {
    url.hostname = "hiabhi.com";
    return Response.redirect(url.toString(), 301);
  }
  return next();
};
