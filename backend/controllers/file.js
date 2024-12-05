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
    const userId = req.user.id;
    const sharedFolder = await prisma.folder.findMany({
      where: {
        shareFolder: true,
      },
      select: {
        id: true,
      },
    });

    let sharedFile = (
      await Promise.all(
        sharedFolder.map(async (folder) => {
          return prisma.file.findMany({
            where: { folderId: folder.id },
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
        })
      )
    ).flat();

    res.status(200).json({ files: sharedFile, userId });
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
        category: true,
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
  body("category").trim().escape(),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    handleValidationErrors(req, res);

    try {
      const userId = req.user.id;
      const folderId =
        req.body.folderId === "null" ? null : Number(req.body.folderId);
      const fileCategory = req.body.category;

      let resource_type = "auto";
      const newFile = await cloudinary.uploader.upload(req.file.path, {
        resource_type: resource_type,
        folder: "fileUploader",
      });

      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString("en-EN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const sizeInBytes = req.file.size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      await prisma.file.create({
        data: {
          name: req.body.fileName,
          category: fileCategory,
          size: `${sizeInMB.toFixed(2)} MB`,
          url: newFile.secure_url,
          public_id: newFile.public_id,
          createdAt: formattedDate,
          userId: userId,
          folderId: folderId,
        },
      });

      await fs.promises.unlink(req.file.path);

      res.status(201).json({ message: "File saved" });
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
      const userId = req.user.id;
      const fileId = Number(req.body.fileId);
      const fileData = await prisma.file.findUnique({
        where: {
          id: fileId,
          userId: userId,
        },
        select: {
          public_id: true,
          url: true,
        },
      });

      let fileType = "auto";
      if (fileData.url.includes("/image/upload/")) {
        fileType = "image";
      } else if (fileData.url.includes("/video/upload/")) {
        fileType = "video";
      } else if (fileData.url.includes("/audio/upload/")) {
        fileType = "audio";
      }

      await cloudinary.uploader.destroy(fileData.public_id, {
        resource_type: fileType,
      });
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
      const fileId = Number(req.params.id);
      const fileData = await prisma.file.findUnique({
        where: {
          id: fileId,
        },
        select: {
          name: true,
          public_id: true,
          url: true,
        },
      });

      let fileType = "auto";
      if (fileData.url.includes("/image/upload/")) {
        fileType = "image";
      } else if (fileData.url.includes("/video/upload/")) {
        fileType = "video";
      } else if (fileData.url.includes("/audio/upload/")) {
        fileType = "audio";
      }

      const downloadUrl = cloudinary.url(fileData.public_id, {
        resource_type: fileType,
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
