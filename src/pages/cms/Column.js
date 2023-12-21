import { PureComponent } from "react";
import Component from "./Component";
import ColumnStyle from "../../styles/ColumnStyle";
import MyContext from "../../components/MyContext";

/**
 * props: type: (header, footer, body, mega_menu, product_list), column, animationStyles
 */
class Column extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            cssID: this.props.type + "_column_" + this.props.column.id
        }
    }
    render() {
        return (
            <div id={this.state.cssID} style={{ width: `${this.props.column.width_numerator / this.props.column.width_denominator * 100}%` }}>
                {this.context.theme_settings && <ColumnStyle style={this.props.column.style} themes={this.context.theme_settings} cssID={this.state.cssID} />}
                {this.props.column.components && this.props.column.components.map((component) => (
                    <Component key={component.id} component={component} animationStyles={this.props.animationStyles} type={this.props.type} />
                ))}
            </div>
        )
    }
}

Column.contextType = MyContext
export default Column