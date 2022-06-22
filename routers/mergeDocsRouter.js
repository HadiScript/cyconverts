const express = require('express');
const path = require("path");
const fs = require('fs')
const pdfMerge = require('easy-pdf-merge')
const multer = require('multer')

const router = express.Router();

var outputFilePath;

var dir = "merge";
var subDirectory = "merge/uploads";

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);

    fs.mkdirSync(subDirectory);
}

console.log("am running, just above storage folder")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "merge/uploads");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    }
});

const mergeFilter = function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
        ext !== ".pdf"
    ) {
        return callback("This Extension is not supported");
    }
    callback(null, true);
};

var upload = multer({ storage: storage })



router.post('/', upload.array('file', 3), (req, res) => {

    let files = []
    outputFilePath = Date.now() + "output.pdf"
    if (req.files) {
        req.files.forEach(file => {
            console.log(file.path)
            files.push(file.path)
        });

        pdfMerge(files, { output: outputFilePath })
            .then((buffer) => {
                res.download(outputFilePath, (err) => {
                    if (err) {
                        fs.unlinkSync(outputFilePath)
                        res.send("Some error takes place in downloading the file")
                    }
                    fs.unlinkSync(outputFilePath)
                })
            })
            .catch((err) => {
                if (err) {
                    fs.unlinkSync(outputFilePath)
                    res.send("Some error takes place in merging the pdf file")
                }
            })
    }
})


module.exports = router