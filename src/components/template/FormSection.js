import React, { PureComponent } from "react";
import SectionStyle2 from "../../styles/SectionStyle";
import MyContext from "../MyContext";
import FormRow from "./FormRow";
import Responsive from "../../components/helpers/Responsive";

/**
 * props: section, appearance, errors
 * @props onChangeComponent for set value component
 */
class FormSection extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            cssID: "form" + "_section_" + this.props.section.id
        }
    }

    content = () => (
        <div id={this.props.section.style.css_id || this.state.cssID}>
            <div>
                {this.context.theme_settings && <SectionStyle2 style={this.props.section.style} themes={this.context.theme_settings}
                    cssID={this.props.section.style.css_id || this.state.cssID} />}

                {this.props.section.rows && this.props.section.rows.map((row) => (
                    <FormRow key={row.id} row={row} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />
                ))}
            </div>
        </div>
    )

    render() {
        return (
            <Responsive desktop={
                this.props.section.style.visibility_desktop && this.content()
            } mobile={
                this.props.section.style.visibility_mobile && this.content()
            } />
        )
    }
}

FormSection.contextType = MyContext
export default FormSection