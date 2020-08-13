const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Listing = require("../models/listings");
const User = require("../models/users");
const DatabaseError = require("../models/databaseError");
const { DEFAULT_PROFILE_PIC } = require("../constants/details");

const addNewUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  let hashedPassword;
  // 12 is the strength of the hash
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new DatabaseError(err.message));
  }

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    profilePicURL: DEFAULT_PROFILE_PIC,
    description: "",
    dateJoined: new Date(),
    lastLoggedIn: new Date(),
  });
  /*
  let token;
  jwt.sign({userID})
  */

  try {
    await newUser.save();
  } catch (err) {
    return next(new DatabaseError(err.message));
  }

  res.status(201).json({ userID: newUser.id });
};

// function to validate email and username
const validateField = async (req, res, next) => {
  const [field] = Object.keys(req.body);
  let existingUser;
  let isValid;
  let hasLoaded;

  try {
    if (field === "email") {
      existingUser = await User.findOne({ email: req.body[field] });
      hasLoaded = true;
    } else if (field === "username") {
      existingUser = await User.findOne({ username: req.body[field] });
      hasLoaded = true;
    }
  } catch (err) {
    return next(new DatabaseError(err.message));
  }

  if (hasLoaded) {
    if (existingUser) {
      isValid = false;
    } else isValid = true;

    res.json({ isValid });
  }
};

const login = async (req, res, next) => {
  const { username, password } = req.body;
  let existingUser;
  let validCredentials;
  let userID;

  try {
    existingUser = await User.findOne({ username });
  } catch (err) {
    return next(new DatabaseError(err.message));
  }

  // if username is wrong
  if (!existingUser) {
    validCredentials = false;
  } else {
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      return next(new DatabaseError(err.message));
    }

    if (!isValidPassword) {
      validCredentials = false;
    } else {
      // updates when the user successfully logs in
      existingUser.lastLoggedIn = new Date();
      try {
        await existingUser.save();
      } catch (err) {
        return next(new DatabaseError(err.message));
      }

      userID = existingUser.id;
      validCredentials = true;
    }
  }
  res.json({ validCredentials, userID });
};

const getUserbyID = async (req, res, next) => {
  const userID = req.params.userID;
  let matchedUser;

  // todo: add error handling in the event that id sent is not 24 chars
  if (userID.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      matchedUser = await User.findById(userID, { __v: 0 }).populate({
        path: "listings",
        select: { __v: 0 },
      });
    } catch (err) {
      return next(new DatabaseError(err.message));
    }
  }

  res.json({ matchedUser });
};

const getUserbyName = async (req, res, next) => {
  const username = req.params.username;
  let matchedUser;

  try {
    matchedUser = await User.findOne({ username }, { __v: 0 }).populate({
      path: "listings",
      select: { __v: 0 },
    });
  } catch (err) {
    return next(new DatabaseError(err.message));
  }

  res.json({ matchedUser });
};

const updateProfileDetails = async (req, res, next) => {
  const userID = req.params.userID;
  const updatedInfo = req.body;
  let fileToUnlink;
  let error;

  // remove all fields with null or undefined values
  for (var property in updatedInfo) {
    if (updatedInfo[property] === null || updatedInfo[property] === undefined) {
      delete updatedInfo[property];
    }
  }

  // finds the user to update
  let matchedUser;

  try {
    matchedUser = await User.findById(userID);
  } catch (err) {
    return next(new DatabaseError(err.message));
  }

  if (matchedUser) {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      if (req.file) {
        // queues the old profile pic for deletion if there is a new pic exists
        if (matchedUser.profilePicURL != DEFAULT_PROFILE_PIC) {
          fileToUnlink = matchedUser.profilePicURL.substring(1);
        }
        // creates a new file path to where the user profile pic is stored
        matchedUser.profilePicURL = "/" + req.file.path;
      }

      // iterates through whatever fields have updates and update them in the matchedUser
      Object.keys(updatedInfo).forEach(
        (key) => (matchedUser[key] = updatedInfo[key])
      );

      await matchedUser.save({ session });

      // if the username updated, find all of the user's listing and update the owner field
      if (updatedInfo.username !== matchedUser.username) {
        for (listingID of matchedUser.listings) {
          const listing = await Listing.findById(listingID);
          listing.owner = updatedInfo.username;
          await listing.save({ session });
        }
      }

      await session.commitTransaction();
    } catch (err) {
      // if transaction fail, queue the image file that has been uploaded for deletion instead
      if (req.file) {
        fileToUnlink = req.file.path;
      }
      error = err;
    }

    if (fileToUnlink) {
      fs.unlink(fileToUnlink, function (err) {
        console.log("Error while deleting files", err);
      });
    }

    if (error) {
      return next(new DatabaseError(error.message));
    }
  }

  res.json({ userID });
};

const updateInventory = async (req, res, next) => {
  const userID = req.params.userID;
  const inventory = req.body.inventory;

  // even if inventory is empty, it would be an empty array
  if (inventory) {
    // finds the user to update
    let matchedUser;

    try {
      matchedUser = await User.findById(userID);
    } catch (err) {
      return next(new DatabaseError(err.message));
    }

    if (matchedUser) {
      matchedUser.inventory = inventory;
    }
    try {
      await matchedUser.save();
    } catch (err) {
      return next(new DatabaseError(err.message));
    }
    res.json({ userID });
  }
};

const updateWishlist = async (req, res, next) => {
  const userID = req.params.userID;
  const wishlist = req.body.wishlist;

  if (wishlist) {
    // finds the user to update
    let matchedUser;

    try {
      matchedUser = await User.findById(userID);
    } catch (err) {
      return next(new DatabaseError(err.message));
    }

    if (matchedUser) {
      matchedUser.wishlist = wishlist;
    }
    try {
      await matchedUser.save();
    } catch (err) {
      return next(new DatabaseError(err.message));
    }
  }
  res.json({ userID });
};

exports.updateInventory = updateInventory;
exports.updateWishlist = updateWishlist;
exports.updateProfileDetails = updateProfileDetails;
exports.addNewUser = addNewUser;
exports.getUserbyID = getUserbyID;
exports.getUserbyName = getUserbyName;
exports.validateField = validateField;
exports.login = login;
