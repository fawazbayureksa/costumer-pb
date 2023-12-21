import React from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';

import Config from '../axios/Config';
import axios from 'axios'

let mapboxToken = ''

/**
 * 
 * @param {object} data maps data 
 * @returns 
 */
const MapBoxReadOnly = (props) => {

    const mapContainer = useRef(null);
    const map = useRef(null);
    const centerMarker = useRef(null)

    useEffect(() => {
        if (map.current) return; // initialize map only once
        if(!props.data) return;

        getMapboxToken().then(()=>{
            setupMapbox()
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

    const setupMapbox=()=>{
        if(!props.data.lng_lat) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/mapbox/${props.data.type}`,
            center: [props.data.lng_lat[0], props.data.lng_lat[1]],
            zoom: props.data.zoom_level,
        });

        if(props.data.is_wheel_scrollable === "no"){
            map.current.scrollZoom.disable();
        }
        if(props.data.can_pan === "no"){
            map.current.dragPan.disable();
        }

        if(props.data.show_scale_control === "yes"){
            const scale = new mapboxgl.ScaleControl();
            map.current.addControl(scale); 
        }

        if(props.data.show_navigation_control === "yes"){
            const navigation = new mapboxgl.NavigationControl();
            map.current.addControl(navigation); 
        }

        centerMarker.current = new mapboxgl.Marker({
            draggable: false,
        }).setLngLat([props.data.lng_lat[0], props.data.lng_lat[1]]).addTo(map.current);
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
            {props.data.lng_lat && <div className="map-sidebar">
                Longitude: {props.data.lng_lat[0]} | Latitude: {props.data.lng_lat[1]}
            </div>}
            <div ref={mapContainer} style={{height: props.data.height, width: props.data.width}} />
        </div>
    </>);
}

export default MapBoxReadOnly