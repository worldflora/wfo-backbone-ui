import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import { useQuery, gql } from "@apollo/client";

const SYNONYMS_QUERY = gql`
  query getSynonyms($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            taxonPlacement{
                id,
                acceptedName{
                    id
                },
                synonyms{
                    id,
                    wfo,
                    fullNameString
                },
            }
        }
    }
`;

function CardSynonyms(props) {

    const { loading, data } = useQuery(SYNONYMS_QUERY, {
        variables: { wfo: props.wfo }
    });

    let name = data ? data.getNameForWfoId : null;
    let synonyms = [];

    if (name && name.taxonPlacement && name.taxonPlacement.acceptedName && name.taxonPlacement.acceptedName.id === name.id) {
        synonyms = name.taxonPlacement.synonyms;
    }

    //    if (name && name.taxonPlacement && name.taxonPlacement.synonyms) {
    //        synonyms = name.taxonPlacement.synonyms;
    //    }



    function renderSynonyms() {
        if (synonyms && synonyms.length > 0) {
            return synonyms.map((syn) => (
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

        if (!synonyms) return null;

        return <span style={badgeStyle} >{' '}<Badge pill bg="secondary">{synonyms.length.toLocaleString()}</Badge></span>;
    }

    // finally rendering land

    if (loading) {
        return (
            <Card bg="warning" className="wfo-child-list" style={{ marginBottom: "1em" }}>
                <Card.Header>Synonyms {getCountBadge()}</Card.Header>
                <Card.Body>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Card.Body>
            </Card>
        );
    }

    if (!synonyms || synonyms.length < 1) return null;

    return (
        <Card bg="warning" className="wfo-child-list" style={{ marginBottom: "1em" }}>
            <Card.Header>Synonyms {getCountBadge()}</Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto" }}>
                {renderSynonyms()}
            </ListGroup>
        </Card>
    );

}
export default CardSynonyms;