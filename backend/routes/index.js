const express = require("express");
const router = express.Router();
const authentication_controllers = require("../controllers/authentication");
const user_controllers = require("../controllers/user");
const file_controllers = require("../controllers/file");
const folder_controllers = require("../controllers/folder");

// Authentication Controllers
router.post("/sign-in", authentication_controllers.sign_in_post);

router.post("/sign-up", authentication_controllers.sign_up_post);

router.get("/demo-account", authentication_controllers.demo_account_get);

router.get(
  "/authentication-check",
  authentication_controllers.authentication_check_get
);

router.get("/logout", authentication_controllers.logout_get);

// User controllers

router.get("/user-data", user_controllers.user_data_get);

// File Controllers

router.get("/shared-files", file_controllers.shared_file_get);

router.post("/new-file", file_controllers.file_post);

router.delete("/remove-file", file_controllers.file_delete);

router.get("/download-files/:id", file_controllers.file_download_get);

// Folder Controllers

router.get("/get-folders/:id", folder_controllers.folder_get);

router.post("/new-folder", folder_controllers.folder_post);

router.put("/change-name-folder", folder_controllers.folder_put);

router.delete("/remove-folder", folder_controllers.folder_delete);

module.exports = router;
