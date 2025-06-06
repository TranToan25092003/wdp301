const { Contact } = require("../../model");

/**
 * ====================================
 * [GET] /admin/contact
 * ====================================
 */
module.exports.getContact = async (req, res) => {
  try {
    let contact = await Contact.findOne();

    if (!contact) {
      contact = await Contact.create();
    }

    return res.status(200).json({
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something wrong in get contact info",
    });
  }
};

/**
 * ====================================
 * [PATCH] /admin/contact
 * ====================================
 */
module.exports.updateContact = async (req, res) => {
  try {
    await Contact.findOneAndUpdate({}, { $set: req.body });

    return res.status(200).json({
      message: "update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something wrong in update contact info",
    });
  }
};
