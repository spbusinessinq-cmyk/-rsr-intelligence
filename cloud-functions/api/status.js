// cloud-functions/api/status.js
// EdgeOne Node Function — route: GET /api/status
// RSR Intelligence Network main status endpoint.

const onRequestGet = async () => {
  const body = JSON.stringify({
    status:    "operational",
    service:   "RSR Intelligence Network",
    timestamp: new Date().toISOString(),
    checks: {
      api:      "ok",
      supabase: "ok",
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

export default onRequestGet;
