import { PureComponent } from "react";
import ColumnStyle from "../../styles/ColumnStyle";
import MyContext from "../MyContext";
import FormComponent from "./FormComponent";

/**
 * props: column, appearance, onChangeComponent, errors
 */
class FormColumn extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            cssID: "form" + "_column_" + this.props.column.id
        }
    }
    render() {
        return (
            <div id={this.state.cssID} style={{ width: `${this.props.column.width_numerator / this.props.column.width_denominator * 100}%` }}>
                {this.context.theme_settings && <ColumnStyle style={this.props.column.style} themes={this.context.theme_settings} cssID={this.state.cssID} />}
                {this.props.column.components && this.props.column.components.map((component) => (
                    <FormComponent key={component.id} component={component} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />
                ))}
            </div>
        )
    }
}

FormColumn.contextType = MyContext
export default FormColumn