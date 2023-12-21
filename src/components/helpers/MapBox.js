
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { useTranslation } from 'react-i18next';
import Config from '../axios/Config';
import axios from 'axios'

let mapboxToken = ''

/**
 * @param {function} onSave when center coordinate is saved
 * @param {function} onCancel when change is cancelled
 */
const MapBox = (props)=>{

    const mapContainer = useRef(null);
    const map = useRef(null);
    const centerMarker = useRef(null)
    const [t] = useTranslation()
    const [lngLat, setLngLat] = useState([0,0]);
    const [zoom, setZoom] = useState(15);

    useEffect(() => {
        if (map.current) return; // initialize map only once

        getMapboxToken().then(()=>{
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    setLngLat([position.coords.longitude, position.coords.latitude])
    
                    setupMapbox(position.coords.longitude, position.coords.latitude)
                }, (err)=>{
                    console.log(err)
                    setupMapbox(-70.9, 42.35)
                });
            } else {
                console.log("geolocation Not Available");
            }  
        }).catch((error)=>{
            console.log(error)
        })
              
    },[]);

    const getMapboxToken=async()=>{
        if(mapboxToken) {
            mapboxgl.accessToken = mapboxToken;
            return;
        }

        await axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getMapboxToken`, Config({})).then(response => {            
            mapboxgl.accessToken = response.data.data;
            mapboxToken = response.data.data;
        }).catch(error => {
            console.log(error);
            throw error
        }).finally(() => {
            //
        });
    }

    const setupMapbox=(thisLng, thisLat)=>{
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [thisLng, thisLat],
            zoom: zoom,
        });

        centerMarker.current = new mapboxgl.Marker({
            draggable: false,
        }).setLngLat([thisLng, thisLat]).addTo(map.current);

        const geocoder = new MapboxGeocoder({
            // Initialize the geocoder
            accessToken: mapboxgl.accessToken, // Set the access token
            mapboxgl: mapboxgl, // Set the mapbox-gl instance
            marker: false, // Do not use the default marker style
            proximity: {
                longitude: thisLng,
                latitude: thisLat
            } // Coordinates of user location
        });
          
        // Add the geocoder to the map
        map.current.addControl(geocoder);

        map.current.on('move', () => {
            let currentLng = map.current.getCenter().lng.toFixed(4)
            let currentLat = map.current.getCenter().lat.toFixed(4)
            setLngLat([currentLng,currentLat])
            setZoom(map.current.getZoom().toFixed(2));
            centerMarker.current.setLngLat([currentLng,currentLat])
        });
    }

    const save =()=>{
        if(props.onSave) props.onSave(lngLat)
    }
    
    return (<>
        <div className="position-relative">
            <style>{`
            .map-sidebar {
                background-color: rgba(35, 55, 75, 0.9);
                color: #fff;
                padding: 6px 12px;
                z-index: 1;
                position: absolute;
                top: 0;
                left: 0;
                margin: 12px;
                border-radius: 4px;
            }
            `}</style>
            <div className="map-sidebar">
                Longitude: {lngLat[0]} | Latitude: {lngLat[1]} | Zoom: {zoom}
            </div>
            <div ref={mapContainer} style={{height: 400}} />
        </div>

        {props.onSave && props.onCancel && <div className="d-flex justify-content-end mt-3">            
            <button type="button" onClick={props.onCancel} className="btn border-707070 shadow-graph color-374650 font-weight-bold">{t('general.cancel')}</button>
            <button type="submit" onClick={save} className="btn bgc-accent-color shadow-graph font-weight-bold ml-3">{t('general.save')}</button>
        </div>}
    </>);
}
export default MapBox;