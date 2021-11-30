import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";

class CardChildren extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderChildren = () => {
        if (this.props.children && this.props.children.length > 0) {
            return this.props.children.map((kid) => (
                <ListGroup.Item
                    action
                    key={kid.id}
                    onClick={(e) => { e.preventDefault(); window.location.hash = kid.acceptedName.wfo; }}
                >
                    <span dangerouslySetInnerHTML={{ __html: kid.acceptedName.fullNameString }} />
                </ListGroup.Item>
            ));
        } else {
            return (<ListGroup.Item>No sub-taxa</ListGroup.Item>);
        }
    }


    getCountBadge = () => {

        const badgeStyle = {
            fontSize: "80%",
            verticalAlign: "super"
        };

        if (!this.props.children) return "";

        return <span style={badgeStyle} >{' '}<Badge pill variant="secondary">{this.props.children.length.toLocaleString()}</Badge></span>;
    }

    render() {

        const { children, navigateToItem } = this.props;
        return (
            <Card className="wfo-child-list" style={{ marginTop: "1em" }}>
                <Card.Header>Child Taxa</Card.Header>
                <Card.Body>
                    <ListGroup>
                        {this.renderChildren(children, navigateToItem)}
                    </ListGroup>
                </Card.Body>
            </Card>
        );
    }
}
export default CardChildren;