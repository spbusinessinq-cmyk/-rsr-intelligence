


app.get('/api/status', (req, res) => {

  res.json({

    ok: true,

    service: 'rsrintel',

    status: 'ONLINE',

    timestamp: new Date().toISOString(),

    version: '1.0.0',

    metrics: {},

    notes: ['RSR Intelligence Network operational']

  });

});



