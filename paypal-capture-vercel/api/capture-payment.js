const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API } = process.env;
  const { orderID } = req.body;

  if (!orderID) {
    return res.status(400).json({ error: "Missing orderID" });
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const tokenRes = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = tokenRes.data.access_token;

    const captureRes = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return res.status(200).json({
      success: true,
      captureResult: captureRes.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};