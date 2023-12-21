import { PureComponent } from "react";
import Checkbox from "../../widgets/forms/Checkbox";
import Email from "../../widgets/forms/Email";
import Number from "../../widgets/forms/Number";
import Phone from "../../widgets/forms/Phone";
import SelectField from "../../widgets/forms/SelectField";
import Button from "../../widgets/Button";
import Text from "../../widgets/forms/Text";
import TextArea from "../../widgets/forms/TextArea";
import Notice from "../../widgets/Notice";
import Date from "../../widgets/forms/Date";
import MyContext from "../MyContext";
import ComponentStyle from "../../styles/ComponentStyle";

/**
 * props: component, appearance, onChangeComponent, errors
 */
class FormComponent extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            cssID: "form" + "_component_" + this.props.component.id
        }
    }
    render() {
        return (
            <div id={this.state.cssID}>
                {this.context.theme_settings && this.props.component.style && <ComponentStyle style={this.props.component.style} themes={this.context.theme_settings} cssID={this.state.cssID} />}

                {this.props.component.type === "text" && <Text data={this.props.component} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />}
                {this.props.component.type === "text_area" && <TextArea data={this.props.component} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />}
                {this.props.component.type === "email" && <Email data={this.props.component} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />}
                {this.props.component.type === "phone_number" && <Phone data={this.props.component} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />}
                {this.props.component.type === "number" && <Number data={this.props.component} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />}
                {this.props.component.type === "select" && <SelectField data={this.props.component} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />}
                {this.props.component.type === "checkbox" && <Checkbox data={this.props.component} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />}
                {this.props.component.type === "submit" && <Button type="submit" data={this.props.component.setting_value} />}
                {this.props.component.type === "notice" && <Notice data={this.props.component.setting_value} />}
                {this.props.component.type === "date" && <Date data={this.props.component} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />}
            </div>
        )
    }
}

FormComponent.contextType = MyContext
export default FormComponent