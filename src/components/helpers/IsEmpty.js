const IsEmpty = (data) => {
    if (
        typeof data === 'undefined' ||
        data === undefined ||
        data === null ||
        data === '' ||
        data === 0 ||
        data.length === 0
    ) {
        return true;
    } else {
        if (typeof data === 'string') return data.replace(/\s/g, '').length === 0;
        return false;
    }
}

export default IsEmpty;