import React from "react";
import Card from "react-bootstrap/Card";

function CardSandboxWarning(props) {


    let hostname = window.location.hostname;

    if (hostname == 'rhakhis.rbge.info') {
        return (
            <Card bg="warning" text="light" style={{ marginBottom: "1em" }}>
                <Card.Header>🏖️ This is the Sandbox Server: Data will be overwritten nightly. {hostname}</Card.Header>
            </Card>
        );
    } else if (hostname == 'list-api-mo.rbge.info') {
        return (
            <Card bg="info" text="light" style={{ marginBottom: "1em" }}>
                <Card.Header>🇺🇸 This is the Missouri server. Data will be overwritten nightly till we switch. {hostname}</Card.Header>
            </Card>
        );
    } else {
        return null;
    }


}
export default CardSandboxWarning;
