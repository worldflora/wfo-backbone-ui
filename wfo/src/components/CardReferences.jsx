import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Card from "react-bootstrap/Card";
import { useQuery, gql } from "@apollo/client";
import CardReferencesList from "./CardReferencesList";

const CHILDREN_QUERY = gql`
  query getTaxonName($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            taxonPlacement{
                id,
                acceptedName{
                    id
                }
            }
        }
    }
`;

function CardReferences(props) {

    const { data } = useQuery(CHILDREN_QUERY, {
        variables: { wfo: props.wfo }
    });

    // no data we don't know who we are so we don't render.
    if (!data) return null;

    // if we are to display links to taxa but we don't have a taxon placement (we are unplaced) then we don't allow it.
    if (props.linkTo === 'taxon' && data.getNameForWfoId && !data.getNameForWfoId.taxonPlacement) return null;

    return (
        <Card bg={props.headerColour} text={props.headerTextColour} style={{ marginBottom: "1em" }}>

            <Card.Header>
                <OverlayTrigger
                    key="reference-head-display-text-overlay"
                    placement="top"
                    overlay={
                        <Tooltip id={`tooltip-reference-head-display-text`}>
                            {props.toolTip}
                        </Tooltip>
                    }
                >
                    <span>{props.headerText}</span>
                    </OverlayTrigger>
            </Card.Header>
            
            
            <CardReferencesList modalHeader={props.modalHeader} modalText={props.children} linkTo={props.linkTo} wfo={props.wfo} preferredKind={props.preferredKind} addButtonText={props.addButtonText} />
        </Card>

    );
}
export default CardReferences;