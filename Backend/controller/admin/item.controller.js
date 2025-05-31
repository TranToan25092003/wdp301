const { Item } = require("../../model");

module.exports.getAllItems = async (req, res) => {
  try {
    const rawData = await Item.find().populate("typeId categoryId statusId");

    const returnData = rawData.map(
      ({ _id, name, price, images, typeId, statusId, categoryId }) => {
        return {
          _id,
          name,
          price,
          image: images[0],
          type: typeId.name,
          status: statusId.name,
          category: categoryId.name,
        };
      }
    );

    return res.json({
      data: returnData,
    });
  } catch (error) {
    return res.json({
      message: "errors in get items admin",
    });
  }
};
