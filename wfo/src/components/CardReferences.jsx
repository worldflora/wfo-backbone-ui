import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import { useMutation, useQuery, gql } from "@apollo/client";
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
            <Card.Header>{props.headerText}</Card.Header>
            <CardReferencesList modalHeader={props.modalHeader} modalText={props.children} linkTo={props.linkTo} wfo={props.wfo} permittedKinds={props.permittedKinds} addButtonText={props.addButtonText} />
        </Card>

    );
}
export default CardReferences;