const { Bid } = require("../../model");

module.exports.getBidAuction = async (id) => {
  const bids = await Bid.find({
    auctionId: id,
  });

  return bids;
};
