const hbjs = require("handbrake-js");
const path = require("path");
const express = require("express");
const bodyparser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

const ImageProcessRoute = require('./routers/ImageProcessRouter')
const DocsConverterRouter = require('./routers/DocsConverterRouter')
const mergeDocsRouter = require('./routers/mergeDocsRouter')
const ImageCompressorRouter = require('./routers/ImageCompress')


const app = express();

const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// static
app.use(express.static("logo"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.resolve(__dirname + "merge/uploads")));
app.use(express.static(path.resolve(__dirname + "images")));

app.use('/docs-merge', mergeDocsRouter)

// styles
app.use('./assets', express.static('assets'))

// merging documents


// pages rendering
app.get('/', (req, res) => {
    res.render('pages/index');
})
app.get('/convert-images', (req, res) => {
    res.render('pages/ImageConverter');
})

app.get('/convert-docs', (req, res) => {
    res.render('pages/DocsConverter');
})

app.get('/convert-videos', (req, res) => {
    res.render('pages/VideoConverter');
})

app.get('/reduce-images', (req, res) => {
    res.render('pages/ImageReducer');
})

app.get('/compress-images', (req, res) => {
    res.render('pages/ImageCompressor');
})


// pages render ends

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const videoFilter = function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
        ext !== ".mp4" &&
        ext !== ".avi" &&
        ext !== ".flv" &&
        ext !== ".wmv" &&
        ext !== ".mov" &&
        ext !== ".mkv" &&
        ext !== ".gif" &&
        ext !== ".m4v"
    ) {
        return callback("This Extension is not supported");
    }
    callback(null, true);
};

var maxSize = 10000 * 1024 * 1024;

var uploadvideo = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: videoFilter,
}).single("file");

app.use(express.static(path.resolve(__dirname + "public/uploads")));




// image process

// dynamic creating folder
var list = ""
var dir = "ImageProcessing";
var subDirectory = "ImageProcessing/uploads";
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);

    fs.mkdirSync(subDirectory);
}


app.use(express.static('ImageProcessing'))
app.use('/processimage', ImageProcessRoute)



// image processing

app.use('/image-compressor', ImageCompressorRouter)

// docs converter
app.use(express.static('pdf'))
app.use('/docs-converter', DocsConverterRouter)

// docs converter --




app.post("/uploadvideo", (req, res) => {
    uploadvideo(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file." + err);
        }
        res.json({
            path: req.file.path,
        });

        console.log(req.file.path, "paths")
    });
});

let output;
app.post("/convertvideo", (req, res) => {
    console.log(req.body, "from converter");
    output = Date.now() + "output." + req.body.format;
    const options = {
        input: path.resolve(__dirname, req.body.path),
        output: output,
        preset: "Very Fast 480p30",
    };
    hbjs.exec(options, function (err, stdout, stderr) {
        if (err) throw err;
        console.log(stdout);

        res.json({
            path: output,
        });
        console.log('after exec handbrake - js')
    });
});

app.get("/download", (req, res) => {
    console.log("running download")
    var pathoutput = req.query.path;
    console.log(pathoutput, "from download");
    var fullpath = path.join(__dirname, pathoutput);
    // console.log(fullpath)
    res.download(fullpath, (err) => {
        if (err) {
            fs.unlinkSync(fullpath);
            res.send(err);
        }
        fs.unlinkSync(fullpath);
    });
});


app.listen(PORT, () => {
    console.log("App is listening on port 5000");
});