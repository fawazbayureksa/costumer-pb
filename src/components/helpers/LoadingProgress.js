const LoadingProgress=({wholePage = false})=>{
    const inner =()=>(
        <div className="spinner-border m-auto" role="status">
            <span className="sr-only">Loading...</span>
        </div>
    )
    if(wholePage) return(
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
            {inner()}
        </div>
    )
    else return(
        <div style={{display:'grid'}}>
            {inner()}
        </div>
    )
}

export default LoadingProgress