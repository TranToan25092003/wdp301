const { stripe } = require("../config/stripe");

// this controller is for testing do not write any logic code here please
module.exports.checkHealth = async (req, res) => {
  console.log(req.user.id);

  const charges = await stripe.charges.list({ limit: 100 });

  res.status(200).json({
    message: "System is healthy",
    data: charges.data,
  });
};
// ------------------------------------------------------------
