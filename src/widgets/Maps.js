import React, { lazy, Suspense } from "react";
import LoadingProgress from "../components/helpers/LoadingProgress";

const MapBoxReadOnly = lazy(()=>import("../components/helpers/MapBoxReadOnly"));

/**
 * 
 * @param {object} data maps data 
 * @returns 
 */
const Maps = (props) => {    
    return (<Suspense fallback={<LoadingProgress />}>
        <MapBoxReadOnly data={props.data} />
    </Suspense>);
}

export default Maps