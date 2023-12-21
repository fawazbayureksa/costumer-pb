import { PureComponent } from "react";
import Column from "./Column";
import RowStyle from "../../styles/RowStyle";
import MyContext from "../../components/MyContext";

/**
 * props: type: (header, footer, body, mega_menu, product_list), row, animationStyles
 */
class Row extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            cssID: this.props.type + "_row_" + this.props.row.id
        }
    }

    render() {
        return (
            <div id={this.state.cssID} >
                {this.context.theme_settings && <RowStyle style={this.props.row.style} themes={this.context.theme_settings} cssID={this.state.cssID} />}
                {this.props.row.columns && this.props.row.columns.map((column) => (
                    <Column key={column.id} column={column} animationStyles={this.props.animationStyles} type={this.props.type} />
                ))}
            </div>
        )
    }
}

Row.contextType = MyContext
export default Row