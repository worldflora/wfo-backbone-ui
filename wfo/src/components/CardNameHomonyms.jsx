import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import { useQuery, gql } from "@apollo/client";

const HOMONYMS_QUERY = gql`
   query getNameHomonyms($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            homonyms{
                id,
                wfo,
                fullNameString
            }
        }
    }
`;

function CardNameHomonyms(props) {

    const { data } = useQuery(HOMONYMS_QUERY, {
        variables: { wfo: props.wfo }
    });

    let name = data ? data.getNameForWfoId : null;
    if (!name) return null;
    if (!name.homonyms || name.homonyms.length === 0) return null;

    return (
        <Card bg="secondary" text="white" style={{ marginBottom: "1em" }}>
            <Card.Header>Homonyms</Card.Header>
            <ListGroup variant="flush" style={{ backgroundColor: "white", color: "gray" }} >
                {
                    name.homonyms.map(n => {
                        return <ListGroup.Item action
                            key={n.id}
                            onClick={(e) => { e.preventDefault(); window.location.hash = n.wfo; }}
                        ><span dangerouslySetInnerHTML={{ __html: n.fullNameString }} /> ({n.wfo})</ListGroup.Item>
                    })
                }
            </ListGroup>
        </Card>

    );

}
export default CardNameHomonyms;
