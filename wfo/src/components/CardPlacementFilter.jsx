import React from "react";
import Form from "react-bootstrap/Form";




function CardPlacementFilter(props) {

    // if there is no filter needed or we lack a filter string we render 
    if (!props.filterNeeded && !props.filter) return null;

    return (
        <Form.Group controlId="filterBox" style={{ marginTop: "1em" }}>
            <Form.Control type="text" placeholder="Type beginning of name" autoFocus={true} name="filterBox" value={props.filter} onChange={props.handleFilterChange} />
        </Form.Group>
    );

}
export default CardPlacementFilter;


