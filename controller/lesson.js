const Lesson = require('../models/lesson');
const Video = require('../models/video');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


//---Start lesson pdf-------
// Set storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize multer upload object
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|jpg|jpeg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: PDF, JPG, JPEG, PNG and GIF files only!');
    }
  }
}).fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'imgFile', maxCount: 1 }
]);



exports.createLesson = (req, res) => {
  // Call the upload middleware
  upload(req, res, (err) => {
    if (err) {
      res.render('lesson.ejs', { message: err });
      console.log(err)
    } else {
      // Create a new Lesson object with the fields from the form and the uploaded file
      const newLesson = new Lesson({
        title: req.body.title,
        description: req.body.description,
        pdfFilePath: req.files.pdfFile[0].filename, // Make sure you have defined this field in your schema
        imgFilePath: req.files.imgFile ? req.files.imgFile[0].filename : undefined // Make sure you have defined this field in your schema
      });
      // Save the new Lesson object to the database
      newLesson.save((err) => {
        if (err) {
          // If there is an error, delete the uploaded files and render an error message
          if (req.files.pdfFile) {
            fs.unlink(`public/uploads/${req.files.pdfFile[0].filename}`, (err) => {
              if (err) throw err;
            });
          }
          if (req.files.imgFile) {
            fs.unlink(`public/uploads/${req.files.imgFile[0].filename}`, (err) => {
              if (err) throw err;
              console.log(err)
            });
          }
          console.log(err); // Print the error object to the console
          res.render('lesson.ejs', { message: 'Error saving lesson to database!' });
        } else {
          res.redirect('/lessons');
        }
      });
    }
  });
};


  

  exports.getLessons= (req,res) => {
    Lesson.find({}, (err, lessons) => {
      if (err) {
        console.error(err);
        res.render('error.ejs', { message: 'Error fetching lessons from database' });
      } else {
        res.render('lesson.ejs', { lessons: lessons });
      }
    });
  
  }


  exports.getLesson =async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        return res.status(404).render('404.ejs');
      }
      res.render('lesson-details.ejs', { lesson });
    } catch (error) {
      console.log(error);
      res.status(500).render('500.ejs');
    } 
  }


  exports.viewLesson = (req, res) => {
    const lessonId = req.params.lessonId;
  
    Lesson.findById(lessonId, (err, lesson) => {
      if (err || !lesson) {
        return res.status(404).send('Lesson not found');
      }
  
      const filePath = `public/uploads/${lesson.pdfFilePath}`;
  
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return res.status(500).send('Error reading PDF file');
        }
  
        res.contentType('application/pdf');
        res.send(data);
      });
    });
  };


  exports.downloadPdf=async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id);
      console.log(req.params.id)
      if (!lesson) {
        return res.status(404).send('Lesson not found');
      }
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${lesson.pdfFilePath}`,
      });
      res.download(`public/uploads/${lesson.pdfFilePath}`);
    } catch (error) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  }


exports.addVideo = (req, res) => {
  const newVideo = new Video({
    title: req.body.title,
    link: req.body.link
  });

  newVideo.save((err) => {
    if (err) {
      console.error(err);
      res.render('error.ejs', { message: 'Error saving video to database' });
    } else {
      res.redirect('/lessons');
    }
  });
};

// Post video controller


exports.addVideo = async (req,res) => {
  const {title,url} = req.body
  console.log(title,url)
  try {
    const video = new Video({
      title: title,
      url:url
    });

    const savedVideo = await video.save();
    console.log('Video saved:', savedVideo);

    res.redirect('/videos');
  } catch (error) {
    console.error('Failed to save video:', error);
    res.render('error', { message: 'Failed to save video.' });
  }
}



exports.getVideos=async (req, res) => {
  try {
    const videos = await Video.find();
    res.render('videos', { videos });
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    res.render('error', { message: 'Failed to fetch videos.' });
  }
}