const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const MIME_TYPE_MAP = {
  "image/png": ".png",
  "image/jpeg": ".jepg",
  "image/jpg": ".jpg",
};

const fileUpload = multer({
  limits: 500000, // 500kb upload size
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "images/profile");
    },
    // name of file = randomly generated id + correct file extension
    filename: (req, file, callback) => {
      const fileExtension = MIME_TYPE_MAP[file.mimetype];
      callback(null, uuidv4() + fileExtension);
    },
  }),
  // prevents files that are not png, jpeg or jpg from being uploaded
  fileFilter: (req, file, callback) => {
    // !! converts undefined/ null to false, everything else to true
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    callback(error, isValid);
  },
});

module.exports = fileUpload;
