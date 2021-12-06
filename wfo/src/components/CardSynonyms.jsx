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

        return <span style={badgeStyle} >{' '}<Badge pill bg="secondary">{this.props.synonyms.length.toLocaleString()}</Badge></span>;
    }

    render() {

        if (!this.props.synonyms || this.props.synonyms.length < 1) return null;

        return (
            <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
                <Card.Header>Synonyms {this.getCountBadge()}</Card.Header>
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