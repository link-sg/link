const { SECRET_JWT_HASH } = require("../constants/details");
const jwt = require("jsonwebtoken");
const DatabaseError = require("../models/databaseError");

// placed in front of middleware where the user must be logged in or it denies access
const auth = (req, res, next) => {
  try {
    // obtain web token from the string set in the header of the req
    const token = req.cookies.access_token;
    const username = req.cookies.username;
    if (!token || !username) {
      const error = new Error("Authentication failed");
      error.status = 401;
      throw error;
    }

    jwt.verify(token, SECRET_JWT_HASH, (err, data) => {
      if (err) {
        throw new DatabaseError(err.message);
      }
      // data.iat = time cookie was issued at;
      req.userID = data.userID;
    });
    next();
  } catch (err) {
    return next(err);
  }
};

// Place in front of middleware that add additional details if user is logged in
const softAuth = (req, res, next) => {
  try {
    // obtain web token from the string set in the header of the req
    const token = req.cookies.access_token;
    const username = req.cookies.username;
    if (token && username) {
      jwt.verify(token, SECRET_JWT_HASH, (err, data) => {
        if (err) {
          throw new DatabaseError(err.message);
        }
        // data.iat = time cookie was issued at;
        req.userID = data.userID;
      });
    }
    next();
  } catch (err) {
    return next(err);
  }
};

// indicates that the api endpoint is for a new page
// used by headers to check for new notifications

const newPage = (req, res, next) => {
  req.newPage = true;
  next();
};
/*
const  = (req, res, next) => {
  const token = req.cookies.access_token;

  // skips if user is not currently logged in
  if (token) {
    jwt.verify(token, SECRET_JWT_HASH, (err, data) => {
      if (err) {
        throw new DatabaseError(err.message);
      }

      const userID = data.userID;
      let newMessages;

      // checks if user received new messages
      // todo: destructure
      mongoose
        .find(userID, { newMessages: 1, _id: 0 })
        .exec(function (err, data) {
          if (err) throw new DatabaseError(err.message);
          else {
            newMessages = data.newMessages;
          }
        });

      req.body.newMessages = newMessages;
    });
  }
  next();
};
*/

exports.auth = auth;
exports.softAuth = softAuth;
//exports.checkNotif = checkNotif;
