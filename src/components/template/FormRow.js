import React, { PureComponent } from "react";
import RowStyle from "../../styles/RowStyle";
import MyContext from "../MyContext";
import FormColumn from "./FormColumn";

/**
 * props: row, appearance, errors
 * @props onChangeComponent for set value component
 */
class FormRow extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            cssID: "form" + "_row_" + this.props.row.id
        }
    }

    render() {
        return (
            <div id={this.state.cssID}>
                {this.context.theme_settings && <RowStyle style={this.props.row.style} themes={this.context.theme_settings} cssID={this.state.cssID} />}

                {this.props.row.columns && this.props.row.columns.map((column) => (
                    <FormColumn key={column.id} column={column} appearance={this.props.appearance} onChangeComponent={this.props.onChangeComponent} errors={this.props.errors} />
                ))}
            </div>
        )
    }
}

FormRow.contextType = MyContext
export default FormRow