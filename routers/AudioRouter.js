const fs = require('fs')
const readline = require('readline')
const express = require('express');
// var YoutubeMp3Downloader = require("youtube-mp3-downloader");
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
// const ffmpeg = require('ffmpeg-static');
// const path = require('path');


const router = express.Router();


router.post("/", async (req, res) => {

    if (req.body.link) {
        const id = req.body.link

        let info = await ytdl.getInfo(id);
        let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        console.log('Formats with only audio: ' + audioFormats.length,);
        console.log(
            info.videoDetails,
            // info.videoDetails.likes,
            // info.videoDetails.viewCount,
            // info.videoDetails.quality,
            // info.videoDetails.lengthSeconds
        );
    }


});


const DownloadAudio = (filename, id, req, res) => {
    let stream = ytdl(id, {
        quality: 'highestaudio',
    });


    let start = Date.now();
    ffmpeg(stream)
        .audioBitrate(128)
        .save(`./mp3/${filename}.mp3`)
        .on('progress', p => {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`${p.targetSize}kb downloaded`);
        })
        .on('end', () => {
            res.download(`./mp3/${filename}.mp3`, (err) => {
                if (err) {
                    console.log(err)
                    fs.unlinkSync(`./mp3/${filename}.mp3`);

                }
                fs.unlinkSync(`./mp3/${filename}.mp3`);

                console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
            })


        });

}



// var YD = new YoutubeMp3Downloader({
//     "ffmpegPath": ffmpeg,        // FFmpeg binary location
//     "outputPath": "/path/to/mp3/folder",    // Output file location (default: the home directory)
//     "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
//     "queueParallelism": 2,                  // Download parallelism (default: 1)
//     "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
//     "allowWebm": false                      // Enable download from WebM sources (default: false)
// });

// YD.download("Vhd6Kc4TZls");

// YD.on("finished", function (err, data) {
//     console.log(JSON.stringify(data));
// });

// YD.on("error", function (error) {
//     console.log(error);
// });

// YD.on("progress", function (progress) {
//     console.log(JSON.stringify(progress));
// });


// router.post('/', (req, res) => {
//     console.log(req.body.link)

//     let filename = 'file.mp3'
//     if (req.body.link) {

//         var YD = new YoutubeMp3Downloader({
//             ffmpegPath: ffmpeg,
//             outputPath: './mp3/',
//             youtubeVideoQuality: "highestaudio",
//             queueParallelism: 2,
//             progressTimeou: 2000,
//             allowWebm: false
//         });
//         console.log(req.body.link)
//         YD.download("Vhd6Kc4TZls", filename)

//         YD.on("finished", function (err, data) {
//             var fullpath = path.join(__dirname, data.file);
//             res.download(fullpath, (err) => {
//                 if (err) throw err;
//                 console.log(data.file);
//                 fs.unlinkSync(data.file)
//             });

//             // res.download(data.file)
//             // console.log(data.file);
//             // fs.unlinkSync(data.file)

//         });

//         YD.on("error", function (error) {
//             console.log(error);
//         });

//         YD.on("progress", function (progress) {
//             console.log('form progress');
//             console.log(JSON.stringify(progress));

//         });


//     }
// })


module.exports = router;