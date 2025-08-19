import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import { useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import CardSynonymsMoveModal from "./CardSynonymsMoveModal"; 
import CardSynonymsFullModal from "./CardSynonymsFullModal"; 


const SYNONYMS_QUERY = gql`
  query getSynonyms($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            fullNameString,
            taxonPlacement{
                id,
                canEdit,
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
    if(!name) return null;

    let synonyms = [];

    if (name && name.taxonPlacement && name.taxonPlacement.acceptedName && name.taxonPlacement.acceptedName.id === name.id) {
        synonyms = name.taxonPlacement.synonyms;
    }

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


    // finally rendering land

    if (loading) {
        return (
            <Card bg="warning" className="wfo-child-list" style={{ marginBottom: "1em" }}>
                <Card.Header>Synonyms <CardSynonymsMoveModal
                    synonyms={synonyms}
                /></Card.Header>
                <Card.Body>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Card.Body>
            </Card>
        );
    }

    if (!synonyms || synonyms.length < 1) return null;

    let editMessage = "";
    if (name.taxonPlacement && name.taxonPlacement.canEdit){
        editMessage = " Click the number badge for bulk actions.";
    }

    return (
        <Card bg="warning" className="wfo-child-list" style={{ marginBottom: "1em" }}>
            <Card.Header>
            <OverlayTrigger
                key="synonym-head-display-text-overlay"
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-synonym-head-display-text`}>
                        The names that are considered synonyms within this taxon. 
                        {editMessage}
                    </Tooltip>
                }
            >
                        <span>Synonyms</span>
            </OverlayTrigger>
            <CardSynonymsMoveModal synonyms={synonyms} name={name} />
            <CardSynonymsFullModal name={name} />
            </Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto" }}>
                {renderSynonyms()}
            </ListGroup>
        </Card>
    );

}
export default CardSynonyms;