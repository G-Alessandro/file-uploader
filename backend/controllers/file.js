const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const cloudinary = require("../utils/cloudinary/cloudinary-config");
const multer = require("../utils/multer/multer");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.folder_file_get = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ error: errorsMessages });
  }
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
  body("folderId").optional().trim().escape(),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ error: errorsMessages });
    }
    try {
      const userId = req.user.id;
      const newFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "fileUploader",
      });

      await prisma.file.create({
        data: {
          name: req.body.fileName,
          size: req.file.size.toString(),
          url: newFile.secure_url,
          public_id: newFile.public_id,
          userId: userId,
          folder: req.body.folderId ? req.body.folderId : null,
        },
      });

      await fs.promises.unlink(req.file.path);

      res.status(200).json({
        file: {
          url: newFile.secure_url,
          public_id: newFile.public_id,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while saving the file.",
      });
    }
  }),
];

exports.file_delete = [
  body("fileId").trim().escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ error: errorsMessages });
    }

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
      res.status(200).json({ message: "File removed!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "An error occurred while deleting the file.",
      });
    }
  }),
];
