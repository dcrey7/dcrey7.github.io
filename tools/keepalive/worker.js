/* The heartbeat: a Cloudflare Worker on a cron that pings the Supabase
   REST endpoint every two days. Any request counts as activity, and the
   free plan only pauses a project after about a week WITHOUT activity,
   so this keeps the reviews database awake for ever, for free.

   The key here is the anon key: public by design (the same one the site
   ships to every browser). Row level security does the protecting. */

const URL = 'https://tzahyhzkxhedcuobalkr.supabase.co/rest/v1/recommendations?select=id&limit=1';

export default {
  async scheduled(event, env, ctx) {
    const res = await fetch(URL, {
      headers: {
        apikey: env.SUPABASE_ANON,
        Authorization: `Bearer ${env.SUPABASE_ANON}`
      }
    });
    console.log('supabase keepalive:', res.status);
  }
};
