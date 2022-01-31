import React, { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";


function CardPlacementList(props) {

    // don't render at all if we are the wrong kind of action
    if (props.selectedAction === 'none') return null;
    if (props.selectedAction === 'remove') return null;
    if (!props.possibleTaxa) return null;

    // return nothing if we have nothing
    if (props.possibleTaxa.length < 1) {
        return (
            <ListGroup variant="flush" style={{}} >
                <ListGroup.Item key="0">Nothing found</ListGroup.Item>
            </ListGroup>
        );
    }

    return (
        <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto" }} >
            {
                props.possibleTaxa.map((t, i) => {
                    return <ListGroup.Item
                        key={i}
                        action
                        disabled={!t.acceptedName.canEdit}
                        onClick={(e) => { e.preventDefault(); props.handleItemSelect(t); }}>
                        <span dangerouslySetInnerHTML={{ __html: t.acceptedName.fullNameString }} />
                    </ListGroup.Item>
                })
            }
        </ListGroup>
    );

}
export default CardPlacementList;


