const { stripe } = require("../config/stripe");
const { clerkClient } = require("../config/clerk");
const { Session, PayoutRequest } = require("../model");
/**
 * ====================================
 * [POST] /coin/secret
 * ====================================
 */
module.exports.secret = async (req, res) => {
  const requestHeaders = new Headers(req.headers);

  const origin = requestHeaders.get("origin");

  const total = req.body.total;

  const linItems = [
    {
      quantity: 1,
      price_data: {
        currency: "vnd",
        product_data: {
          name: "Coin: 💸💸💸",
        },
        unit_amount: total,
      },
    },
  ];

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      metadata: {
        total: total * 1000,
        totalCoin: total,
      },
      line_items: linItems,
      mode: "payment",
      return_url: `${origin}/coin/confirm?session_id={CHECKOUT_SESSION_ID}`,
    });

    return res.json({
      clientSecret: session.client_secret,
    });
  } catch (error) {
    return res.json({
      message: "error in get secret stripe",
    });
  }
};

/**
 * ====================================
 * [GET] /coin/confirm
 * ====================================
 */
module.exports.confirm = async (req, res) => {
  const session_id = req.query.session_id;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const existSession = await Session.findOne({
      session_id,
    });

    if (existSession) {
      return res.status(200).json({
        message: "success",
      });
    }

    const totalAmount = Number.parseInt(session.metadata?.total);
    const totalCoin = Number.parseInt(session.metadata?.totalCoin);

    // done
    if (session.status == "complete") {
      const oldCoin = Number.parseInt(req.user.publicMetadata?.coin) || 0;

      await clerkClient.users.updateUserMetadata(req.userId, {
        publicMetadata: {
          coin: oldCoin + totalCoin,
        },
      });

      await Session.create({
        session_id,
      });

      await PayoutRequest.create({
        action: "plus",
        adminNote: "",
        amount: totalCoin,
        status: "completed",
        customerClerkId: req.userId,
      });
    } else {
      return res.status(200).json({
        message: "success",
      });
    }
  } catch (error) {
    res.json({
      status: "failed",
      message: "Something wrong in top up coin",
    });
  }

  return res.status(200).json({
    message: "success",
  });
};
