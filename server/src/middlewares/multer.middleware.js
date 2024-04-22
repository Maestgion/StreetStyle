import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        
        const fileExtension = path.extname(file.originalname)
        const fileNameWithoutExtension= file.originalname
        .toLowerCase()
        .replace(/\s+/g, '-') 
        .replace(/[^a-z0-9.-]/g, '') 
        .split('.')[0]; 

        const uniqueFileName = fileNameWithoutExtension + 
        '-' +
        Date.now() +
        '-' +
        Math.ceil(Math.random()*1e5) +
        fileExtension

        cb(null, uniqueFileName)
    }
})


export const upload = multer({

    storage: storage,
    limits:{ fileSize: 5 * 1024 * 1024},
    fileFilter: function(req, file, cb){
        const allowedFileTypes = /jpeg|png|jpg/
        const extName = allowedFileTypes.test(path.extname(file.originalname)).toLowerCase()
        const mimeType = allowedFileTypes.test(file.mimetype)
        
        if(extName && mimeType)
        {
            cb(null, true)
        }else{
            cb(new Error("Invalid file type. Only jpg, jpeg, and png  are allowed"))
        }
    }
})


export const multerError = (err, req, res, next) => {
    if (err) {
    
      if (err instanceof multer.MulterError) {
     
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size exceeds the limit (5MB)' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
       
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  
    next();
  };