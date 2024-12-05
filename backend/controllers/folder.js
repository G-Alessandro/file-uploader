const asyncHandler = require("express-async-handler");
const { body, param } = require("express-validator");
const handleValidationErrors = require("../utils/validation/validation");
const cloudinary = require("../utils/cloudinary/cloudinary-config");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.folder_get = [
  param("id").trim().escape(),
  asyncHandler(async (req, res) => {
    handleValidationErrors(req, res);

    try {
      const userId = req.user.id;
      const folderId = Number(req.params.id);

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
          userId: true,
          name: true,
          category: true,
          size: true,
          url: true,
          public_id: true,
          createdAt: true,
        },
      });
      res.status(200).json({ userId, folders: subFolder, files: folderFile });
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
      const newFolder = await prisma.folder.create({
        data: {
          name: req.body.folderName,
          userId: userId,
          shareFolder: shareFolder,
          parentFolderId: parentFolderId,
        },
      });

      if (parentFolderId) {
        await prisma.folder.update({
          where: { id: parentFolderId },
          data: {
            subFolders: {
              connect: { id: newFolder.id },
            },
          },
        });
      }

      res.status(201).json({ message: "Folder created" });
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
      const userId = req.user.id;
      const folderId = Number(req.body.folderId);
      let subFoldersId = [];
      let folderToCheckId = [];

      const folderToDelData = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { subFolders: { select: { id: true } } },
      });

      function findSubFolder(folder) {
        if (folder.subFolders.length > 0) {
          for (let i = 0; i < folder.subFolders.length; i += 1) {
            folderToCheckId.push(folder.subFolders[i].id);
          }
        }
      }

      findSubFolder(folderToDelData);

      while (folderToCheckId.length > 0) {
        const currentFolderId = folderToCheckId.shift();
        subFoldersId.push(currentFolderId);

        const folderChecked = await prisma.folder.findUnique({
          where: { id: currentFolderId },
          select: { subFolders: { select: { id: true } } },
        });

        findSubFolder(folderChecked);
      }

      const filesToDelete = [];
      for (const folderId of subFoldersId) {
        const files = await prisma.file.findMany({
          where: { userId: userId, folderId: folderId },
          select: { id: true, public_id: true, url: true },
        });
        filesToDelete.push(...files);
      }

      await Promise.all(
        filesToDelete.map(async (file) => {
          let fileType = "auto";
          if (file.url.includes("/image/upload/")) fileType = "image";
          else if (file.url.includes("/video/upload/")) fileType = "video";
          else if (file.url.includes("/audio/upload/")) fileType = "audio";

          await cloudinary.uploader.destroy(file.public_id, {
            resource_type: fileType,
          });
        })
      );

      await Promise.all(
        [...subFoldersId, folderId].map(async (folderId) => {
          await prisma.file.deleteMany({
            where: { userId: userId, folderId: folderId },
          });
        })
      );

      await prisma.folder.deleteMany({
        where: { userId: userId, id: { in: subFoldersId } },
      });

      await prisma.folder.delete({
        where: { id: folderId },
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
