const asyncHandler = require("express-async-handler");
const { body, param } = require("express-validator");
const handleValidationErrors = require("../utils/validation/validation");
const cloudinary = require("../utils/cloudinary/cloudinary-config");
const multer = require("../utils/multer/multer");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.shared_file_get = asyncHandler(async (req, res) => {
  handleValidationErrors(req, res);
  try {
    const sharedFolder = await prisma.folder.findMany({
      where: {
        shareFolder: true,
      },
      select: {
        id: true,
      },
    });
    const sharedFile = await Promise.all(
      sharedFolder.map(async (id) => {
        prisma.file.findMany({
          where: { folderId: id },
          select: {
            id: true,
            name: true,
            size: true,
            url: true,
            public_id: true,
            createdAt: true,
          },
        });
      })
    );

    res.status(200).json({ sharedFile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while searching for shared files.",
    });
  }
});

exports.folder_file_get = asyncHandler(async (req, res) => {
  handleValidationErrors(req, res);

  try {
    const userId = req.user.id;
    const allFolder = await prisma.folder.findMany({
      where: {
        userId: userId,
        parentFolderId: null,
      },
      select: {
        id: true,
        name: true,
      },
    });
    const allFile = await prisma.file.findMany({
      where: {
        userId: userId,
        folderId: null,
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

    res.status(200).json({
      files: allFile,
      folders: allFolder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while searching for user profile data.",
    });
  }
});

exports.file_post = [
  multer.single("file"),
  body("fileName").trim().isLength({ min: 1, max: 40 }).escape(),
  body("fileId").optional().trim().escape(),
  body("category").optional().trim().isLength({ min: 1, max: 20 }).escape(),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    handleValidationErrors(req, res);

    try {
      const userId = req.user.id;
      const folderId = req.body.folderId ? req.body.folderId : null;
      const fileCategory = req.user.category;

      const newFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "fileUploader",
      });

      await prisma.file.create({
        data: {
          name: req.body.fileName,
          category: fileCategory,
          size: req.file.size.toString(),
          url: newFile.secure_url,
          public_id: newFile.public_id,
          userId: userId,
          folderId: folderId,
        },
      });

      await fs.promises.unlink(req.file.path);

      res.status(200).json({ message: "File saved" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while saving the file.",
      });
    }
  }),
];

exports.file_delete = [
  body("fileId").escape(),
  asyncHandler(async (req, res) => {
    handleValidationErrors(req, res);

    try {
      const fileId = req.body.fileId;
      const fileData = await prisma.file.findUnique({
        where: {
          id: fileId,
        },
        select: {
          public_id: true,
        },
      });
      await cloudinary.uploader.destroy(fileData.public_id);
      await prisma.file.delete({
        where: {
          id: fileId,
        },
      });
      res.status(200).json({ message: "File removed" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while deleting the file.",
      });
    }
  }),
];

exports.file_download_get = [
  param("id").escape(),
  asyncHandler(async (req, res) => {
    handleValidationErrors(req, res);

    try {
      const fileId = req.params.id;
      const fileData = await prisma.file.findUnique({
        where: {
          id: fileId,
        },
        select: {
          name: true,
          public_id: true,
        },
      });

      const downloadUrl = cloudinary.url(fileData.public_id, {
        resource_type: "auto",
        flags: "attachment",
        attachment: fileData.name,
      });

      res.status(200).json({
        downloadUrl,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while downloading the file.",
      });
    }
  }),
];
