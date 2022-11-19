const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const router = require('express').Router();
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL
const conn = mongoose.createConnection(mongoURL)

let gfs;
conn.once('open', () => {
       gfs = new mongoose.mongo.GridFSBucket(conn.db, {
              bucketName: 'images'
       })
})

const storage = new GridFsStorage({
       url: mongoURL,
       file: (req, file) => {
              return new Promise((resolve, reject) => {
                     crypto.randomBytes(16, (err, buf) => {
                            if (err) {
                                   return reject(err)
                            }
                            const filename = buf.toString('hex') + path.extname(file.originalname);
                            const fileInfo = {
                                   filename: filename,
                                   bucketName: 'images'
                            };

                            resolve(fileInfo);
                     })
              })
       }
})

const store = multer({
       storage,
       limits: { fileSize: 20000000 },
       fileFilter: (req, file, callback) => {
              checkFileType(file, callback)
       }
})

function checkFileType(file, callback) {
       const filetypes = /jpeg|jpg|png|gif/;
       const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
       const mimetype = filetypes.test(file.mimetype);

       if (mimetype && extname) return callback(null, true);

       callback('filetype')
}

const uploadMiddleware = (req, res, next) => {
       const upload = store.single('image');
       upload(req, res, (err) => {
              if (err instanceof multer.MulterError) {
                     return res.status(400).send('File too large');
              } else if (err) {
                     if (err === 'filetype') return res.status(400).send('Image files only');
                     return res.sendStatus(500)
              }
              next();
       })
}

router.post('/upload', uploadMiddleware, async (req, res) => {
       const { file } = req;
       const { id } = file
       if (file.size > 5000000) {
              deleteImage(id);
              return res.status(400).send('file may not exceed 5mb')
       }
       console.log('uploaded file:', file);
       return res.send(file.id)
})

const deleteImage = id => {
       if (!id || id === 'undefined') return res.status(400).send('no image id');
       const _id = new mongoose.Types.ObjectId(id);
       gfs.delete(_id, err => {
              if (err) return res.status(500).send('image deletion error');
       })
}

router.get('/:id', ({ params: { id } }, res) => {
       if (!id || id === 'undefined') return res.status(400).send('no image id');
       const _id = new mongoose.Types.ObjectId(id);
       gfs.find({ _id }).toArray((err, files) => {
              if (!files || files.length === 0)
                     return res.status(400).send('no files exist');

              gfs.openDownloadStream(_id).pipe(res)
       })
})

module.exports = router;