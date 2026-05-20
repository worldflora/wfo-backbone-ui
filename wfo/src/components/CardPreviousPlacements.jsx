import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Card from "react-bootstrap/Card";
import { useQuery, gql } from "@apollo/client";
import CardReferencesList from "./CardReferencesList";
import ListGroup from "react-bootstrap/ListGroup";

const PLACEMENTS_QUERY = gql`
  query getPreviousPlacements($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            previousPlacements{
                id
                name{
                    wfo
                    fullNameString
                }
                placedInName{
                    wfo
                    fullNameString
                }
                classificationString
                classificationMonthName
                classificationYear
                newRole
            }
        }
    }
`;

function CardPreviousPlacements(props) {

    const { data } = useQuery(PLACEMENTS_QUERY, {
        variables: { wfo: props.wfo }
    });

    // no data we don't know who we are so we don't render.
    if (!data) return null;

    // don't render if there are no previous placements
    if(data.getNameForWfoId.previousPlacements.length == 0) return null;

    //console.log(data.getNameForWfoId.previousPlacements);

    return (
        <Card bg='warning' text='black' style={{ marginBottom: "1em" }}>

            <Card.Header>
                <OverlayTrigger
                    key="reference-head-display-text-overlay"
                    placement="top"
                    overlay={
                        <Tooltip id={`tooltip-reference-head-display-text`}>
                            Changes in placement of this name in previous classifications.
                        </Tooltip>
                    }
                >
                    <span>Previous Placements</span>
                    </OverlayTrigger>
            </Card.Header>
            
            <ListGroup variant="flush" style={{}} >
                {data.getNameForWfoId.previousPlacements.map(placement =>{

                    const action = placement.placedInName ? true : false;
                    const clickPlace = (e) => { e.preventDefault(); window.location.hash = placement.placedInName.wfo; };
                    const disabled = placement.placedInName ? false : true;

                    return <ListGroup.Item 
                            key={placement.id} 
                            action={action}
                            onClick={clickPlace}
                            disabled={disabled}
                            >
                            {placement.classificationString}
                            <span> - became </span>
                            {placement.newRole == 'accepted' ? 'an ' : ''}
                            {placement.newRole == 'synonym' ? 'a ' : ''}
                            {placement.newRole == 'unplaced' ? 'an ' : ''}
                            {placement.newRole == 'deprecated' ? 'a ' : ''}
                            <strong>{placement.newRole}</strong>
                            {placement.newRole == 'accepted' ? ' name in ' : ''}
                            {placement.newRole == 'synonym' ? ' of ' : ''}
                            {placement.newRole == 'unplaced' ? ' name.' : ''}
                            {placement.newRole == 'deprecated' ? ' name.' : ''}
                            {placement.placedInName ?
                                <span dangerouslySetInnerHTML={{ __html: placement.placedInName.fullNameString }} />
                                : ''}
                        </ListGroup.Item>
                })}
                
            </ListGroup>
        </Card>

    );
}
export default CardPreviousPlacements;