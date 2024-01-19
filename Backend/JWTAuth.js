const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Get the token from the Authorization header
  const token = req.headers.authorization;

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify the token
  jwt.verify(token, `${process.env.JWT_KEY}`, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden', err });
    }

    req.userID = user.userID;
    req.role = user.role;

    next();
  });
}

module.exports = authenticateToken;
