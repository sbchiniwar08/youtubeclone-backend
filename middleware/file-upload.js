const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');
dotenv.config();

aws.config.update({
 secretAccessKey: 'qYOU7Fz64uL0wKKt0zpp9/sRs6jLGFBetR3qcMiP',
 accessKeyId: 'AKIARRD6R5VH54FO25KS',
 region: 'ap-south-1' 
});

const s3 = new aws.S3();

/* In case you want to validate your file type */
const fileFilter = (req, file, cb) => {
 if (file.mimetype === 'video/mp4') {
  cb(null, true);
 } else {
  cb(new Error('Wrong file type, only upload mp4!'), 
  false);
 }
};

const upload = multer({
fileFilter: fileFilter,
storage: multerS3({
 acl: 'public-read',
 s3,
 bucket: 'notyoutube',
 key: function(req, file, cb) {
   req.file = Date.now() + file.originalname;
   cb(null, Date.now() + file.originalname);
  }
 })
});

module.exports = upload;