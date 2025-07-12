const { stripe } = require("../../config/stripe");

/**
 * ====================================
 * [GEt] /admin/transaction
 * ====================================
 */
module.exports.getAllTransactions = async (req, res) => {
  const charges = await stripe.charges.list({ limit: 100 });
  const simplifiedData = charges.data.map((item) => {
    const date = new Date(item.created * 1000); // timestamp từ Stripe
    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const pad = (num) => String(num).padStart(2, "0");

    const formattedDate = `${pad(vnDate.getDate())}/${pad(
      vnDate.getMonth() + 1
    )}/${vnDate.getFullYear()} ${pad(vnDate.getHours())}:${pad(
      vnDate.getMinutes()
    )}`;

    return {
      id: item.id,
      amount: item.amount,
      currency: item.currency,
      name: item.billing_details.name,
      email: item.billing_details.email,
      created: formattedDate, // 👉 đã format
      card_brand: item.payment_method_details?.card?.brand || "no",
      status: item.status,
    };
  });

  res.json({
    data: simplifiedData,
  });
};
