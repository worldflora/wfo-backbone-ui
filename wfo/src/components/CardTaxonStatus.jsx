import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import CardTaxonStatusHybrid from "./CardTaxonStatusHybrid";
import CardTaxonStatusFossil from "./CardTaxonStatusFossil";
import { useQuery, gql } from "@apollo/client";

const STATUS_QUERY = gql`
   query getStatus($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            canEdit,
            taxonPlacement{
                acceptedName{
                    id
                }
            }
        }
    }
`;


function CardTaxonStatus(props) {

    const [wfo, setWfo] = useState('');

    const { data } = useQuery(STATUS_QUERY, {
        variables: { wfo: props.wfo }
    });

    let name = data ? data.getNameForWfoId : null;

    // if we don't have a name then don't render at all
    if (!name) return null;

    // can we edit?
    if (!name.canEdit) return null;

    // if not placed we can't render
    if (!name.taxonPlacement) return null;

    // if not taxon we can't render
    if(name.taxonPlacement.acceptedName.id !== name.id ) return null;

    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
    }



    return (
        <Form >
            <Card bg="warning" text="dark" style={{ marginBottom: "1em" }}>
                <Card.Header>
                    <OverlayTrigger
                        key="hybrid-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-hybrid`}>
                                Flags to indicate that this taxon is a hybrid or fossil.
                            </Tooltip>
                        }
                    >
                    <span>Taxon Status</span>
                    </OverlayTrigger>                
                    
                </Card.Header>
                <Card.Body style={{ backgroundColor: "white", color: "black" }} >
                    <CardTaxonStatusHybrid wfo={props.wfo} />
                    <CardTaxonStatusFossil wfo={props.wfo} />
                </Card.Body>
            </Card>
        </Form>

    );

}
export default CardTaxonStatus;
