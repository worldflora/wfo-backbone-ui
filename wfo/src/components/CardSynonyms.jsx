import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";

function CardSynonyms(props) {

    function renderSynonyms() {
        if (props.synonyms && props.synonyms.length > 0) {
            return props.synonyms.map((syn) => (
                <ListGroup.Item
                    action
                    key={syn.id}
                    onClick={(e) => { e.preventDefault(); window.location.hash = syn.wfo; }}
                >
                    <span dangerouslySetInnerHTML={{ __html: syn.fullNameString }} />

                </ListGroup.Item>
            ));
        } else {
            return (<ListGroup.Item>No synonyms</ListGroup.Item>);
        }
    }


    function getCountBadge() {

        const badgeStyle = {
            fontSize: "80%",
            verticalAlign: "super"
        };

        if (!props.synonyms) return "";

        return <span style={badgeStyle} >{' '}<Badge pill bg="secondary">{props.synonyms.length.toLocaleString()}</Badge></span>;
    }

    // finally rendering land

    if (!props.synonyms || props.synonyms.length < 1) return null;

    return (
        <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
            <Card.Header>Synonyms {getCountBadge()}</Card.Header>
            <Card.Body>
                <ListGroup>
                    {renderSynonyms()}
                </ListGroup>
            </Card.Body>
        </Card>
    );

}
export default CardSynonyms;