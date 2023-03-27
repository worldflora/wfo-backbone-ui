import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {
    useQuery,
    gql
} from "@apollo/client";

function handleSubmit(event) {
    event.preventDefault();
    console.log(event);
}

function PageActivity(props) {


    const NAME_ACTIVITY = gql`
  ${props.nameFieldsFragment}
  query getRecentChanges{
        getRecentChanges{
            ...nameFields
        }
    }
`;

    const { data } = useQuery(NAME_ACTIVITY);

    console.log(data);

    // build a distances array with the modified dates in them
    // also an index list

    return (
        <Container style={{ marginTop: "2em" }}>
            <h2>Recently Changed Names</h2>
            <Form onSubmit={handleSubmit} style={{ marginBottom: "1em" }}>
                <Row className="align-items-center">
                    <Col xs="auto">
                        <Button type="submit">Next</Button>
                        <Button type="submit">Search</Button>
                    </Col>
                </Row>
            </Form>
            <p>These are names that have been changed through the UI</p>
        </Container>
    );

}
export default PageActivity