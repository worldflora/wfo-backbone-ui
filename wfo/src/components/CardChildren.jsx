import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";

function CardChildren(props) {

    function renderChildren() {
        if (props.children && props.children.length > 0) {
            return props.children.map((kid) => (
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


    function getCountBadge() {

        const badgeStyle = {
            fontSize: "80%",
            verticalAlign: "super"
        };

        if (!props.children) return "";

        return <span style={badgeStyle} >{' '}<Badge pill bg="secondary">{props.children.length.toLocaleString()}</Badge></span>;
    }

    function getHeader() {

        if (props.children && props.children.length > 0) {
            let rank = props.children[0].acceptedName.rank;
            return rank.plural;
        }

        return "Child Taxa";

    }

    // finally render it

    const { children } = props;

    if (!children || children.length == 0) return null;

    return (
        <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
            <Card.Header>{getHeader()} {getCountBadge()}</Card.Header>
            <Card.Body>
                <ListGroup>
                    {renderChildren(children)}
                </ListGroup>
            </Card.Body>
        </Card>
    );

}
export default CardChildren;