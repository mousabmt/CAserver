const { check , validationResult} = require('express-validator');

module.exports = [
  check('email').isEmail().withMessage('Must be a valid email'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];
