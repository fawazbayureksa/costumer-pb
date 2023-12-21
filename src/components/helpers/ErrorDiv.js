const ErrorDiv = ({error, style}) => {
    return error ? <div className={`alert alert-danger p-2 mt-2 ${style}`} role="alert">{error}</div> : null;
}

export default ErrorDiv