const { Auction } = require("../../model");

module.exports.getAllAuction = async (req, res) => {
  const auctionData = await Auction.find().populate("statusId itemId");

  const returnData = auctionData.map(
    ({ itemId, startTime, startPrice, endTime, statusId, _id }) => {
      return {
        id: _id,
        startTime,
        startPrice,
        endTime,
        status: statusId.name,
        item: {
          name: itemId.name,
          images: itemId.images,
        },
      };
    }
  );

  return res.status(200).json({
    data: returnData,
  });
};
