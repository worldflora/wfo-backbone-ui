import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useMutation, useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const HYBRID_QUERY = gql`
   query getHybridStatus($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            taxonPlacement{
                id,
                isHybrid,
                acceptedName{
                    id,
                    wfo
                }
            }
        }
    }
`;

const UPDATE_HYBRID = gql`
        mutation  updateHybridStatus(
            $id: Int!,
            $isHybrid: Boolean!
            ){
          updateHybridStatus(
              id: $id,
              isHybrid: $isHybrid
          ){
            name,
            success,
            message,
            children{
              name,
              success,
              message
            }
          }
        }
`;

function CardTaxonHybridStatus(props) {

    const [isHybrid, setHybridStatus] = useState(false);
    const [wfo, setWfo] = useState('');

    const { loading, data } = useQuery(HYBRID_QUERY, {
        variables: { wfo: props.wfo }
    });


    // FIXME - HOW DO I UPDATE THE HEADERS OF CHILDREN?

    const [updateHybridStatus] = useMutation(UPDATE_HYBRID, {
        refetchQueries: [
            'getHeaderInfo'
        ],
        update(cache) {
            cache.modify({
                id: cache.identify(name.taxonPlacement),
                fields: {
                    isHybrid(cachedVal) {
                        // just toggle it
                        return !cachedVal;
                    }
                }
            });
        }
    });


    let name = data ? data.getNameForWfoId : null;

    // if we don't have a name then don't render at all
    if (!name) return null;

    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
    }


    if (name.taxonPlacement && name.taxonPlacement.acceptedName.id === name.id) {
        // we are this taxon so it is appropriate
        if (isHybrid !== name.taxonPlacement.isHybrid) setHybridStatus(name.taxonPlacement.isHybrid);
    } else {
        // not an accepted name so don't display
        return null;
    }

    function handleStatusChange(e) {
        setHybridStatus(e.target.checked);
        updateHybridStatus({
            variables: {
                id: parseInt(name.taxonPlacement.id),
                isHybrid: e.target.checked
            }
        });
    }


    return (
        <Form >
            <Card bg="warning" text="dark" style={{ marginBottom: "1em" }}>
                <Card.Header>Hybrid Status</Card.Header>
                <Card.Body style={{ backgroundColor: "white", color: "black" }} >
                    <OverlayTrigger
                        key="hybrid-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-hybrid`}>
                                Flag this taxon as being a hybrid taxon.
                            </Tooltip>
                        }
                    >
                        <Form.Group controlId="hybrid">
                            <Form.Check
                                type="checkbox"
                                id="hybrid"
                                label="Hybrid taxon"
                                onChange={handleStatusChange}
                                checked={isHybrid}
                            />
                        </Form.Group>
                    </OverlayTrigger>
                </Card.Body>
            </Card>
        </Form>

    );

}
export default CardTaxonHybridStatus;
