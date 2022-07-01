import React from "react";
import Card from "react-bootstrap/Card";

function CardSandboxWarning(props) {


    let hostname = window.location.hostname;

    if (hostname !== 'rhakhis.rbge.info') return null;

    return (
        <Card bg="warning" text="light" style={{ marginBottom: "1em" }}>
            <Card.Header>🏖️ This is the Sandbox Server: Data will be overwritten nightly. {hostname}</Card.Header>
        </Card>
    );

}
export default CardSandboxWarning;
