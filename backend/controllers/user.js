const asyncHandler = require("express-async-handler");
const handleValidationErrors = require("../utils/validation/validation");
const he = require("he");
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

    const formattedUserData = {
      firstName: he.decode(
        userData.firstName.charAt(0).toUpperCase() +
          userData.firstName.slice(1).toLowerCase()
      ),
      lastName: he.decode(
        userData.lastName.charAt(0).toUpperCase() +
          userData.lastName.slice(1).toLowerCase()
      ),
    };

    res.status(200).json({ userData: formattedUserData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "User data not found.",
    });
  }
});
