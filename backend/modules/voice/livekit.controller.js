const { AccessToken } = require('livekit-server-sdk');
const config = require('../../config/livekit');

function getToken(req, res) {
  try {
    const { roomId, username } = req.query;

    if (!roomId || !username) {
      return res.status(400).json({ error: 'roomId and username are required' });
    }

    if (!config.apiKey || !config.apiSecret) {
      // Return a dummy token if we don't have livekit configured (for local dev without livekit)
      console.warn('LiveKit API Key or Secret is not configured. Returning local fallback.');
      return res.json({ token: 'local-fallback-token' });
    }

    const at = new AccessToken(config.apiKey, config.apiSecret, {
      identity: username,
      name: username,
    });

    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
    });

    const token = at.toJwt();
    Promise.resolve(token).then((resolvedToken) => {
        res.json({ token: resolvedToken });
    }).catch(err => {
        console.error('Error generating token:', err);
        res.status(500).json({ error: 'Failed to generate token' });
    });

  } catch (error) {
    console.error('Error in getToken:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getToken
};
