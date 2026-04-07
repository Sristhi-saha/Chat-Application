import multer from 'multer';
import path from 'path';

const store = multer.memoryStorage();

const upload = multer({storage:store});

export default upload;