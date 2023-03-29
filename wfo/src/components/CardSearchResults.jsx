import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CardSearchName from "./CardSearchName";

function CardSearchResults(props) {

    const { names, distances, loading, error, showModified } = props;

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;

    // do nothing if we have now content
    if (names === null) {
        return <p>No names</p>;
    };

    return (
        names.map((name, index) => {
            return (
                <Row key={index}>
                    <Col>
                        <CardSearchName name={name} index={index} distances={distances} showModified={showModified} />
                    </Col>
                </Row>
            );
        })

    );



}
export default CardSearchResults