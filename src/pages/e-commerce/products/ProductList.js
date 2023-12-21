import React, { PureComponent } from "react";
import Template from "../../../components/Template";
import axios from "axios";
import Config from "../../../components/axios/Config";
import Section from "../../cms/Section";

class ProductList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            sections: null,
        };
    }

    componentDidMount() {
        this.getProductList();
    }

    getProductList = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getProductList`, Config({}))
            .then(response => {
                if (response.data.data) {
                    response.data.data.forEach(section => {
                        section.rows.forEach(row => {
                            row.columns.forEach(column => {
                                column.components.forEach(component => {
                                    component.value = JSON.parse(component.value)
                                })
                                column.style = JSON.parse(column.style) || {}
                            })
                            row.style = JSON.parse(row.style) || {}
                        })
                        section.style = JSON.parse(section.style) || {}
                    });
                }
                this.setState({
                    sections: response.data.data
                })
            }).catch(error => {
                console.error(error);
            }).finally(() => {
                //
            });
    }

    render() {
        return (
            <Template>
                <div id="body">
                    {this.state.sections && this.state.sections.map((section) => (
                        <Section key={section.id} section={section} type="product_list" />
                    ))}
                </div>
            </Template>
        );
    }
}

export default ProductList