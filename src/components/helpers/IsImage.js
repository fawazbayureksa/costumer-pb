// const getExtension=(filename) =>{
//     let parts = filename.split('.');
//     return parts[parts.length - 1];
// }

const IsImage=(filename)=> {
    // let ext = getExtension(filename);
    // switch (ext.toLowerCase()) {
    //     case 'jpeg':
    //     case 'jpg':
    //     case 'png':
    //     case 'tiff':
    //         return true;
    // }
    // return false;    
    const isImage = require('is-image');

    return isImage(filename);
}

export default IsImage;