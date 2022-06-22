const express = require('express');
const multer = require('multer')
const path = require("path");

const imageSize = require('image-size');
const sharp = require('sharp');
const fs = require('fs')

const router = express.Router();



var width;
var height;
var format;
var outputFilePath;


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "ImageProcessing/uploads");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const imageFilter = function (req, file, cb) {
    if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/webp"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
};

var upload = multer({ storage: storage, fileFilter: imageFilter });





router.post('/', upload.single('file'), (req, res) => {

    format = req.body.format
    width = parseInt(req.body.width)
    height = parseInt(req.body.height)

    if (req.file) {
        // console.log(req.file.path)

        if (isNaN(width) || isNaN(height)) {
            var dimension = imageSize(req.file.path);
            console.log(dimension)

            width = parseInt(dimension.width)
            height = parseInt(dimension.height)

            processImage(width, height, req, res)

        } else {
            processImage(width, height, req, res)
        }
    }
})


function processImage(width, height, req, res) {

    outputFilePath = format ? Date.now() + "output." + format : req.file.filename
    if (req.file) {
        sharp(req.file.path)
            .resize(width, height)
            .toFile(outputFilePath, (err, info) => {
                if (err) throw err;
                res.download(outputFilePath, (err) => {
                    if (err) throw err;
                    fs.unlinkSync(req.file.path);
                    fs.unlinkSync(outputFilePath);
                });
            });
    }
}




// crop image



router.post('/crop-image', upload.single('file'), (req, res) => {

    format = req.body.format
    width = parseInt(req.body.width)
    height = parseInt(req.body.height)

    if (req.file) {
        // console.log(req.file.path)

        if (isNaN(width) || isNaN(height)) {
            var dimension = imageSize(req.file.path);
            console.log(dimension)

            width = parseInt(dimension.width)
            height = parseInt(dimension.height)

            cropImage(width, height, req, res)

        } else {
            var dimension = imageSize(req.file.path);

            if (width > dimension.width || height > dimension.height) {
                alert('Extract area is bad')
            }

            cropImage(width, height, req, res)
        }
    }
})


async function cropImage(width, height, req, res) {
    console.log("crop image running");

    outputFilePath = Date.now() + "output." + format;
    if (req.file) {
        sharp(req.file.path)
            .extract({ width: width, height: height, left: 10, top: 10 })
            // .grayscale()
            .toFile(outputFilePath, (err, info) => {
                if (err) throw err;
                res.download(outputFilePath, (err) => {
                    if (err) throw err;
                    fs.unlinkSync(req.file.path);
                    fs.unlinkSync(outputFilePath);
                });
            });
    }
}




module.exports = router