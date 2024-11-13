const asyncHandler = require("express-async-handler");
const handleValidationErrors = require("../utils/validation/validation");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.user_data_get = asyncHandler(async (req, res) => {
  handleValidationErrors(req, res);
  try {
    const userId = req.user.id;
    const userData = await prisma.userAccount.findUnique({
      where: {
        id: userId,
      },
      select: {
        firstName: true,
        lastName: true,
      },
    });
    res.status(200).json({ userData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "User data not found.",
    });
  }
});
