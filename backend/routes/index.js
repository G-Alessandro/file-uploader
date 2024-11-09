const express = require("express");
const router = express.Router();
const authentication_controllers = require("../controllers/authentication");

// Authentication Controllers
router.post("/sign-in", authentication_controllers.sign_in_post);

router.post("/sign-up", authentication_controllers.sign_up_post);

router.get("/demo-account", authentication_controllers.demo_account_get);

router.get(
  "/authentication-check",
  authentication_controllers.authentication_check_get
);

router.get("/logout", authentication_controllers.logout_get);

module.exports = router;
