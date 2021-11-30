import React, { Component } from "react";
import Breadcrumb from "react-bootstrap/Breadcrumb";


class CardAncestors extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderPath = () => {

        const { ancestors } = this.props;

        let ants = [...ancestors].reverse();

        if (ants && ants.length > 0) {
            return ants.map((ancestor) => {
                if (ancestor.acceptedName) {
                    return (
                        <Breadcrumb.Item key={ancestor.id} href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ancestor.acceptedName.wfo; }} >
                            <span dangerouslySetInnerHTML={{ __html: ancestor.acceptedName.fullNameString }} />
                        </Breadcrumb.Item>
                    );
                } else {
                    return <Breadcrumb.Item>Home</Breadcrumb.Item>
                }


            });
        } else {
            return <Breadcrumb.Item>No Trail</Breadcrumb.Item>
        }
    }

    render() {
        const { ancestors } = this.props;

        return (<Breadcrumb style={{ marginTop: "1em" }} >
            {this.renderPath()}
        </Breadcrumb>);

    }
}
export default CardAncestors;