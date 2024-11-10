const { validationResult } = require("express-validator");

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ error: errorsMessages });
  }
};

module.exports = handleValidationErrors;
