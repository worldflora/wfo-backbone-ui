import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";

class CardSynonyms extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderSynonyms = () => {
        if (this.props.synonyms && this.props.synonyms.length > 0) {
            return this.props.synonyms.map((syn) => (
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


    getCountBadge = () => {

        const badgeStyle = {
            fontSize: "80%",
            verticalAlign: "super"
        };

        if (!this.props.synonyms) return "";

        return <span style={badgeStyle} >{' '}<Badge pill variant="secondary">{this.props.synonyms.length.toLocaleString()}</Badge></span>;
    }

    render() {

        return (
            <Card className="wfo-child-list" style={{ marginTop: "1em" }}>
                <Card.Header>Synonyms</Card.Header>
                <Card.Body>
                    <ListGroup>
                        {this.renderSynonyms()}
                    </ListGroup>
                </Card.Body>
            </Card>
        );
    }
}
export default CardSynonyms;