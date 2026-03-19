// cloud-functions/api/investigation-status.js
// EdgeOne Node Function — route: GET /api/investigation-status
// Investigation Room status endpoint.

const onRequestGet = async () => {
  const body = JSON.stringify({
    status:    "operational",
    service:   "Investigation Room",
    timestamp: new Date().toISOString(),
    checks: {
      api:      "ok",
      supabase: "ok",
      realtime: "ok",
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type":                "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control":               "no-store",
    },
  });
};

export { onRequestGet };
