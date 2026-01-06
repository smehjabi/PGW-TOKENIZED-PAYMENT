
const axios = require("axios");

// ===========================
// In-memory token storage
// ===========================
let bkashToken = {
  id_token: null,
  refresh_token: null,
  createdAt: null,
  expires_in: 3600, // 1 hour
};

// ===========================
// Generate New Token
// ===========================
async function grantToken() {
  const url = process.env.BKASH_BASE_URL + "auth/grant-token";

  const response = await axios.post(
    url,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    {
      headers: {
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
        "Content-Type": "application/json",
      },
    }
  );

  bkashToken = {
    id_token: response.data.id_token,
    refresh_token: response.data.refresh_token,
    createdAt: Date.now(),
    expires_in: response.data.expires_in,
  };

  console.log("✅ bKash token granted:", bkashToken.id_token);

  return bkashToken.id_token;
}

// ===========================
// Ensure Token Is Valid
// ===========================
async function ensureValidToken() {
  const now = Date.now();

  // Refresh token 1 min before expiry
  if (!bkashToken.id_token || now - bkashToken.createdAt >= (bkashToken.expires_in - 60) * 1000) {
    return await grantToken();
  }

  return bkashToken.id_token;
}

module.exports = { ensureValidToken };
