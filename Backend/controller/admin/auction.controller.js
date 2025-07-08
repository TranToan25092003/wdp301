const { clerkClient } = require("../../config/clerk");
const { logApi } = require("../../helper/logApi.helper");
const { Auction } = require("../../model");
const { getBidAuction } = require("./bid.controller");

// get data of an auction
const getAnAuction = async (id) => {
  try {
    const auction = await Auction.findById(id).populate("statusId itemId");

    return auction;
  } catch (error) {
    console.log(error);
  }
};

// [GET] /admin/auction
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

// [GET] /admin/auction/{id}
module.exports.getAnAuction = async (req, res) => {
  logApi(req, res);
  try {
    const auctionId = req.params.id;

    // get auction detail
    const auction = await getAnAuction(auctionId);

    const owner = await clerkClient.users.getUser(auction.itemId.owner);

    const auctionInfo = {
      itemId: auction.itemId._id,
      itemName: auction.itemId.name,
      description: auction.itemId.description,
      image: auction.itemId.images[0],
      startTime: auction.startTime,
      endTime: auction.endTime,
      startPrice: auction.startPrice,
      currentPrice: auction.currentPrice,
      status: auction.statusId.name,
      settled: auction.settled,
      owner: {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.emailAddresses[0]?.emailAddress || null,
        image: owner.imageUrl,
      },
    };

    // get list bids
    const listBid = await getBidAuction(auctionId);

    // get all users take part in
    const uniqueUserIds = [...new Set(listBid.map((bid) => bid.userId))];

    const userTakeIn = await Promise.all(
      uniqueUserIds.map(async (id) => {
        const user = await clerkClient.users.getUser(id);
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0]?.emailAddress || null,
          image: user.imageUrl,
        };
      })
    );
    // end get all users take part in

    return res.status(200).json({
      data: {
        listBid: listBid.map((item) => {
          return {
            price: item.amount,
            time: item.createdAt,
          };
        }),
        userTakeIn,
        auction: auctionInfo,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
