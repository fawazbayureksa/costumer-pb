import { PureComponent } from "react";
import Template from "../../components/Template";
import axios from 'axios'
import Config from "../../components/axios/Config";
import Section from "./Section";
import MetaTrigger from "../../components/MetaTrigger";

export default class Body extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            body: null,
            error404: false
        }
    }
    componentDidMount() {
        this.getBody()
    }
    componentDidUpdate(prevProps) {
        if (prevProps.location !== this.props.location) {
            if (prevProps.location.pathname !== this.props.location.pathname) {
                this.getBody()
                window.scrollTo(0, 0)
            }
        }
    }
    getBody = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}cms/getBody`
        let params = {
            url: this.props.location.pathname,
            type: "main",
        }
        axios.get(url, Config({}, params)).then(res => {
            if (res.data.data && res.data.data.sections) {
                res.data.data.sections.forEach(section => {
                    section.rows.forEach(row => {
                        row.columns.forEach(column => {
                            column.components.forEach(component => {
                                component.value = JSON.parse(component.value)
                                if (component.style) component.style = JSON.parse(component.style) || {}
                            })
                            column.style = JSON.parse(column.style) || {}
                        })
                        row.style = JSON.parse(row.style) || {}
                    })
                    section.style = JSON.parse(section.style) || {}
                });
            }
            this.setState({
                body: res.data.data
            });
        }).catch((error) => {
            console.log(error);
            if (this.props.location.pathname.split('/')[1].length <= 2) {
                console.log('fae')
                this.props.history.push({
                    pathname: '/'
                });
            } else if (error.response) {
                console.log(error.response)
                this.setState({
                    error404: true
                });
            }
        });
    }
    render() {
        return (
            <Template>
                {this.state.body && <MetaTrigger
                    pageTitle={this.state.body.title}
                    pageDesc={this.state.body.description}
                />}

                <div id="body" className="">
                    {this.state.body && this.state.body.sections && this.state.body.sections.map((section) => (
                        <Section key={section.id} section={section} type="body" />
                    ))}
                </div>

                {this.state.error404 && <div className="text-center">
                    page 404 not found
                </div>}
            </Template >
        )
    }
}