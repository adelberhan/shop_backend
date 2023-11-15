const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;

  return jwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      // { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      // { url: /\/api\/v1\/orders(.*)/, methods: ["POST"] },
      // { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      // { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      // `${api}/users/login`,
      // `${api}/users/register`,
      { url: /\/api\/v1\/products(.*)/, methods: ["GET","PUT", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["POST", "GET", "PUT", "DELETE"] },
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS", "PUT"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}

async function isRevoked(req, token) {
  if (!token.payload.isAdmin) {
    return true;
  }
}

module.exports = authJwt;
