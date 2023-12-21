// max_size in byte
const ExceedUploadLimit = (file, max_size) => {
    if (file) {
        let file_size = file.size;
        if (!max_size) max_size = process.env.REACT_APP_MAX_FILE_UPLOAD;
        return {
            value: file_size > max_size,
            max_size: max_size,
        }
    }
};
export default ExceedUploadLimit;