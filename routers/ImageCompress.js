const express = require('express');
const multer = require('multer');
const fs = require('fs')
const path = require('path')
const imagemin = require('imagemin');
const imageminMozJpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

const router = express.Router();



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images/uploads");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
    const file = req.file;
    let ext;
    if (!req.file) {
        const error = new Error('Please Upload a file');
        res.status(400).json({ message: "please upload a image" })
    };

    if (file.mimetype === 'image/jpeg') {
        ext = 'jpg'
    }
    if (file.mimetype === 'image/png') {
        ext = 'png'
    }

    console.log(file.filename, "filename")
    console.log(file.path, "path")
    console.log(ext, "here is extension")



    const files = await imagemin([`images/uploads` + `/*.{jpg,JPG,jpeg,JPEG,png}`], {
        destination: 'output',
        plugins: [
            imageminMozJpeg({ progressive: true, quality: 70 }),
            imageminPngquant({ quality: [0.6, 0.8] })
        ]
    });

    console.log(files);
    res.download(files[0].destinationPath, err => {
        if (err) throw err;
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(`output/${file.filename}`);
    })
    // => [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]

    // res.download(files[0].destinationPath)

})


module.exports = router;