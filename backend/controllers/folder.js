const asyncHandler = require("express-async-handler");
const { body, param } = require("express-validator");
const handleValidationErrors = require("../utils/validation/validation");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.folder_get = [
  param("id").trim().escape(),
  asyncHandler(async (req, res) => {
    handleValidationErrors(req, res);

    try {
      const userId = req.user.id;
      const folderId = req.params.id;

      const subFolder = await prisma.folder.findMany({
        where: {
          userId: userId,
          parentFolderId: folderId,
        },
        select: {
          id: true,
          name: true,
        },
      });

      const folderFile = await prisma.file.findMany({
        where: {
          userId: userId,
          folderId: folderId,
        },
        select: {
          id: true,
          name: true,
          size: true,
          url: true,
          public_id: true,
          createdAt: true,
        },
      });
      res.status(200).json({ folders: subFolder, files: folderFile });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while searching for data.",
      });
    }
  }),
];

exports.folder_post = [
  body("folderName").isLength({ min: 1, max: 40 }).trim().escape(),
  body("parentFolderId").optional().trim().escape(),
  body("shareFolder").trim().escape(),
  asyncHandler(async (req, res) => {
    handleValidationErrors(req, res);

    try {
      const userId = req.user.id;
      const parentFolderId = req.body.parentFolderId
        ? Number(req.body.parentFolderId)
        : null;
      const shareFolder = req.body.shareFolder === "true" ? true : false;
      await prisma.folder.create({
        data: {
          name: req.body.folderName,
          userId: userId,
          shareFolder: shareFolder,
          parentFolderId: parentFolderId,
        },
      });
      res.status(200).json({ message: "Folder created" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while creating a new folder.",
      });
    }
  }),
];

exports.folder_put = [
  body("folderName").isLength({ min: 1, max: 40 }).trim().escape(),
  body("folderId").trim().escape(),
  asyncHandler(async (req, res) => {
    handleValidationErrors(req, res);

    try {
      const folderId = Number(req.body.folderId);
      await prisma.folder.update({
        where: {
          id: folderId,
        },
        data: {
          name: req.body.folderName,
        },
      });
      res.status(200).json({ message: "Folder name changed" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while changing the folder name.",
      });
    }
  }),
];

exports.folder_delete = [
  body("folderId").trim().escape(),
  asyncHandler(async (req, res) => {
    handleValidationErrors(req, res);

    try {
      const folderId = Number(req.body.folderId);
      await prisma.folder.delete({
        where: {
          id: folderId,
        },
      });
      res.status(200).json({ message: "Folder removed" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while deleting the folder.",
      });
    }
  }),
];
