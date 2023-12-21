import React, {PureComponent} from 'react';
import IsEmpty from "../../../components/helpers/IsEmpty";
import Cookie from "js-cookie";
import {TinyMceContent} from "../../../components/helpers/TinyMceEditor";
import MyContext from "../../../components/MyContext";

/**
 * @param {string} type config type
 * @param {object} data mp_product_informations
 */
class ProductInformation extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            activeData: this.getActiveData()
        };
    }

    componentDidUpdate(prevProps){
        if(prevProps.data !== this.props.data){
            this.setState({
                activeTab: 0,
                activeData: this.getActiveData()
            })
        }
    }

    getActiveData=()=>{
        if(!this.props.data || this.props.data.length === 0) return null

        let local_lang = Cookie.get('language_code');
        if (local_lang) {
            let result = this.props.data.find((value) => value.language_code === local_lang) // check for chosen language
            if (result) {
                return result;
            }
            else{
                result = this.props.data.find((value) => value.language_code === "en") // check for english result 
                if (result) {
                    return result;
                }
            }
        }
        return this.props.data[0] // if no result found then get the first data
    }

    render() {
        return (<>
        <MyContext.Consumer>{context => (<>
            <style jsx="true">{`
                .nav-item a.active {
                    font-weight: bold;
                    color: ${context.theme_settings ? context.theme_settings.accent_color.value : ''} !important;
                    background-color: #FAFAFB !important;
                }
            `}</style>
            {this.props.type == "type_1" && 
                <div className="">                   
                    <ul className="nav nav-tabs" role="tablist">
                        {this.state.activeData && this.state.activeData.sections.map((value1, index1)=>(
                            <li className="nav-item" key={index1}>
                                <a
                                    className={`nav-link color-333333 ${this.state.activeTab === index1 && 'active'}`}
                                    id={`section-tab${index1}`}
                                    data-toggle="tab"
                                    href={`#section-${index1}`}
                                    role="tab"
                                    aria-controls="home"
                                    aria-selected="true"
                                    style={{fontSize: '90%'}}
                                    onClick={() => this.setState({activeTab: index1})}
                                >{value1.title}</a>
                            </li>
                        ))}
                        {/* {this.props.data.map((value, index, array) => {
                            let current_active = active;
                            if ((IsEmpty(Cookie.get('language_code')) || !this.props.data.find(data => data.language_code === Cookie.get('language_code')) ? (value.language.code === 'en') : (value.language.code === Cookie.get('language_code')))) {
                                current_active = active;
                                active = false;
                            }
                            if (index === array.length - 1) active = true;
                            return (IsEmpty(Cookie.get('language_code')) || !this.props.data.find(data => data.language_code === Cookie.get('language_code')) ? (value.language.code === 'en') : (value.language.code === Cookie.get('language_code'))) &&
                                <>
                                    {Array.isArray(value.sections) ? value.sections.map((value1, index1) => (
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link color-333333  ${index1 === 0 && 'active'}`}
                                                id={`section-tab${index}-${index1}`}
                                                data-toggle="tab"
                                                href={`#section-${index}-${index1}`}
                                                role="tab"
                                                aria-controls="home"
                                                aria-selected="true"
                                                style={{fontSize: '90%'}}
                                            >{value1.title}</a>
                                        </li>
                                    )) :
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link color-333333  ${current_active && 'active'}`}
                                                id={`section-tab${index}`}
                                                data-toggle="tab"
                                                href={`#section-${index}`}
                                                role="tab"
                                                aria-controls="home"
                                                aria-selected="true"
                                                style={{fontSize: '90%'}}
                                            >{value.sections.title}</a>
                                        </li>}
                                </>;
                        })} */}
                    </ul>
                    <div className="tab-content">
                        {this.state.activeData && this.state.activeData.sections.map((value1, index1)=>(
                            <div className={`tab-pane px-3 fade show ${this.state.activeTab === index1 && 'active'}`} id={`section-${index1}`} role="tabpanel" aria-labelledby={`section-tab${index1}`} key={index1}>
                                <TinyMceContent className="mt-3">{value1.content}</TinyMceContent>
                            </div>
                        ))}
                        {/* {this.props.data.map((value, index, array) => {
                            let current_active = active;
                            if ((IsEmpty(Cookie.get('language_code')) || !this.props.data.find(data => data.language_code === Cookie.get('language_code')) ? (value.language.code === 'en') : (value.language.code === Cookie.get('language_code')))) {
                                current_active = active;
                                active = false;
                            }
                            return (IsEmpty(Cookie.get('language_code')) || !this.props.data.find(data => data.language_code === Cookie.get('language_code')) ? (value.language.code === 'en') : (value.language.code === Cookie.get('language_code'))) &&
                                <>
                                    {Array.isArray(value.sections) ?
                                        value.sections.map((value1, index1) => (
                                            <div className={`tab-pane px-3 fade show ${index1 === 0 && 'active'}`} id={`section-${index}-${index1}`} role="tabpanel" aria-labelledby={`section-tab${index}-${index1}`}>
                                                <TinyMceContent className="mt-3">{value1.content}</TinyMceContent>
                                            </div>
                                        )) :
                                        <div className={`tab-pane px-3 fade show ${current_active && 'active'}`} id={`section-${index}`} role="tabpanel" aria-labelledby={`section-tab${index}`}>
                                            <TinyMceContent className="mt-3">{value.sections.content}</TinyMceContent>
                                        </div>}
                                </>;
                        })} */}
                    </div>
                </div>
            }
            {this.props.type == "type_2" &&
                <div className="bg-white shadow-graph rounded p-4">
                    <ul className="nav nav-tabs" role="tablist">
                        {this.state.activeData && this.state.activeData.sections.map((value1, index1)=>(
                            <li className="nav-item" key={index1}>
                                <a
                                    className={`nav-link color-333333 ${this.state.activeTab === index1 && 'active'}`}
                                    id={`section-tab${index1}`}
                                    data-toggle="tab"
                                    href={`#section-${index1}`}
                                    role="tab"
                                    aria-controls="home"
                                    aria-selected="true"
                                    style={{fontSize: '90%'}}
                                    onClick={() => this.setState({activeTab: index1})}
                                >{value1.title}</a>
                            </li>
                        ))}
                        {/* {this.props.data.map((value, index, array) => {
                            let current_active = active;
                            if ((IsEmpty(Cookie.get('language_code')) || !this.props.data.find(data => data.language_code === Cookie.get('language_code')) ? (value.language.code === 'en') : (value.language.code === Cookie.get('language_code')))) {
                                current_active = active;
                                active = false;
                            }
                            if (index === array.length - 1) active = true;
                            return (IsEmpty(Cookie.get('language_code')) || !this.props.data.find(data => data.language_code === Cookie.get('language_code')) ? (value.language.code === 'en') : (value.language.code === Cookie.get('language_code'))) &&
                                <>
                                    {Array.isArray(value.sections) ? value.sections.map((value1, index1) => (
                                        <li className={`nav-item px-4 pb-2 ${this.state.activeTab == index1 && 'border-bottom-accent-color'}`}>
                                            <a
                                                className={` text-decoration-none ${this.state.activeTab == index1 && 'active accent_color'}`}
                                                id={`section-tab${index}-${index1}`}
                                                data-toggle="tab"
                                                href={`#section-${index}-${index1}`}
                                                role="tab"
                                                aria-controls="home"
                                                aria-selected="true"
                                                style={{fontSize: '90%'}}
                                                onClick={() => this.setState({activeTab: index1})}
                                            >{value1.title}</a>
                                        </li>
                                    )) :
                                        <li className={`nav-item px-4 pb-2 ${current_active && 'border-bottom-accent-color'}`}>
                                            <a
                                                className={` text-decoration-none ${current_active && 'active accent_color'}`}
                                                id={`section-tab${index}`}
                                                data-toggle="tab"
                                                href={`#section-${index}`}
                                                role="tab"
                                                aria-controls="home"
                                                aria-selected="true"
                                                style={{fontSize: '90%'}}
                                            >{value.sections.title}</a>
                                        </li>}
                                </>;
                        })} */}
                    </ul>
                    <div className="tab-content">
                        {this.state.activeData && this.state.activeData.sections.map((value1, index1)=>(
                            <div className={`tab-pane fade show ${this.state.activeTab === index1 && 'active'}`} id={`section-${index1}`} role="tabpanel" aria-labelledby={`section-tab${index1}`} key={index1}>
                                <TinyMceContent className="mt-3">{value1.content}</TinyMceContent>
                            </div>
                        ))}
                        {/* {this.props.data.map((value, index, array) => {
                            let current_active = active;
                            if ((IsEmpty(Cookie.get('language_code')) || !this.props.data.find(data => data.language_code === Cookie.get('language_code')) ? (value.language.code === 'en') : (value.language.code === Cookie.get('language_code')))) {
                                current_active = active;
                                active = false;
                            }
                            return (IsEmpty(Cookie.get('language_code')) || !this.props.data.find(data => data.language_code === Cookie.get('language_code')) ? (value.language.code === 'en') : (value.language.code === Cookie.get('language_code'))) &&
                                <>
                                    {Array.isArray(value.sections) ?
                                        value.sections.map((value1, index1) => (
                                            <div className={`tab-pane fade show ${this.state.activeTab == index1 && 'active'}`} id={`section-${index}-${index1}`} role="tabpanel" aria-labelledby={`section-tab${index}-${index1}`}>
                                                <TinyMceContent className="mt-3 ">{value1.content}</TinyMceContent>
                                            </div>
                                        )) :
                                        <div className={`tab-pane fade show ${current_active && 'active'}`} id={`section-${index}`} role="tabpanel" aria-labelledby={`section-tab${index}`}>
                                            <TinyMceContent className="mt-3 ">{value.sections.content}</TinyMceContent>
                                        </div>}
                                </>;
                        })} */}
                    </div>
                </div>
            }
        </>)}</MyContext.Consumer>
        </>);
    }
}

export default ProductInformation;