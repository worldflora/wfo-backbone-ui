import React from "react";
import Card from "react-bootstrap/Card";
import { useQuery, gql } from "@apollo/client";

const MESSAGE_QUERY = gql`
  query getSystemMessage{
    getSystemMessage
  }
`;

function CardSystemMessage() {

    const { data } = useQuery(MESSAGE_QUERY, { pollInterval: 1000 * 30 });

    // this is an array of message plus style now.
    let message = data ? data.getSystemMessage : null;

    if (message) {
        return (
            <Card bg={message[1]} text="light" style={{ marginBottom: "1em" }}>
                <Card.Header>⚠️ {message[0]}</Card.Header>
            </Card>
        );
    } else {
        return null;
    }

}
export default CardSystemMessage;
