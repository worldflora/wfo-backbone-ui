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

        return <span style={badgeStyle} >{' '}<Badge pill bg="secondary">{this.props.children.length.toLocaleString()}</Badge></span>;
    }

    getHeader = () => {

        if (this.props.children && this.props.children.length > 0) {
            let rank = this.props.children[0].acceptedName.rank;
            return rank.plural;
        }

        return "Child Taxa";

    }


    render() {

        const { children } = this.props;

        if (!children || children.length == 0) return null;

        return (
            <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
                <Card.Header>{this.getHeader()} {this.getCountBadge()}</Card.Header>
                <Card.Body>
                    <ListGroup>
                        {this.renderChildren(children)}
                    </ListGroup>
                </Card.Body>
            </Card>
        );
    }
}
export default CardChildren;