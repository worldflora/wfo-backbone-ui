import React from "react";
import { useQuery, gql } from "@apollo/client";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";

const SIMILAR_NAMES_SEARCH = gql`
query similarNamesSearch($queryString: String!){
    getNamesByStringMatch(queryString: $queryString){
        distances,
        nameParts,
        authors,
        rank,
        names{
            id,
            wfo,
            fullNameString
        }
    }
}
`;

function CardNameSimilar(props) {

    const { data } = useQuery(SIMILAR_NAMES_SEARCH, {
        variables: {
            queryString: props.nameString
        }
    });

    // don't show nothing
    if (!props.nameString) return null;
    if (!data || data.getNamesByStringMatch.names.length < 1) return null;

    return (

        <Card bg="secondary" text="white" className="wfo-child-list" style={{ marginBottom: "1em" }}>
            <Card.Header>Similar Names</Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto" }} >
                {
                    data.getNamesByStringMatch.names.map(n => {
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
export default CardNameSimilar