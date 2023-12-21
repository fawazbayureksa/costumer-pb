import React, {PureComponent} from 'react';
import Cookie from 'js-cookie';
import axios from 'axios'
import TemplateSection from './TemplateSection';
import Config from '../axios/Config';

class Footer extends PureComponent {
    constructor(props){
        super(props)

        this.state = {
            data: null,
        }
    }
    componentDidMount(){
        this.getFooter()
    }
    getFooter=()=>{
        let url = `${process.env.REACT_APP_BASE_API_URL}template/getFooter`
        let params = {
            language_code: Cookie.get("language_code"), 
        }
        axios.get(url, Config({}, params)).then(res => {

            if(res.data.data && res.data.data.sections){
                res.data.data.sections.forEach(section => {
                    section.rows.forEach(row=>{
                        row.columns.forEach(column=>{
                            column.components.forEach(component=>{
                                component.value = JSON.parse(component.value)
                                if(component.style) component.style = JSON.parse(component.style) || {}
                            })
                            column.style = JSON.parse(column.style) || {}
                        })
                        row.style = JSON.parse(row.style) || {}
                    })
                    section.style = JSON.parse(section.style) || {}
                });
            }
            this.setState({
                data: res.data.data
            })
        }).catch((error) => {
            console.log(error)
            if(error.response) console.log(error.response)         
        })
    }
    render(){
        return(
            <div id="footer">
                {this.state.data && this.state.data.sections && this.state.data.sections.map((section)=>(
                    <TemplateSection key={section.id} section={section} type="footer" />
                ))}
            </div>
        )
    }
}


export default Footer;