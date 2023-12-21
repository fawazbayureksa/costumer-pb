import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/js/all.min';
import 'moment/locale/id'
import 'moment/locale/en-gb'
import 'moment/locale/zh-cn'
import 'moment/locale/ja'
import 'moment/locale/jv'
import AppRoute from './AppRoute';
import { requestFCMToken } from './components/helpers/FirebaseEvent';
import Radium, { Style, StyleRoot } from 'radium';
import * as animations from "react-animations";


function App() {
    requestFCMToken();
    if (process.env.REACT_APP_DEBUG_MODE === 'false') {
        window.console.log = function () {
            window.console.log = function () { }
            window.console.error = function () { }
        }
    }

    const styles = {}
    const animationNames = []
    for (let key in animations) {
        animationNames.push(key)
        styles[key] = {
            animation: 'x 1s',
            animationName: Radium.keyframes(animations[key], key)
        }
    }

    return (
        <AppRoute />
    );
}

export default App
