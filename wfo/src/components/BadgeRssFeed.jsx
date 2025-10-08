import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import { useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import CardSynonymsMoveModal from "./CardSynonymsMoveModal"; 
import CardSynonymsFullModal from "./CardSynonymsFullModal";
import Badge from "react-bootstrap/Badge"; 




function BadgeRssFeed(props) {

    const rank = props.name.rank.id;
    
    if(rank != 'family' && rank != 'order') return null;

    let file = props.name.nameString + '.xml';

    let dir = null;

    if(rank == 'order'){
        dir = props.name.nameString;
        file = props.name.nameString + '.xml';
    }else{

        // we have to find the order to use as the dir 
        props.ancestors.map(anc => {
            if(anc.rank.id == 'order'){
                dir = anc.acceptedName.nameString;
            }
        });
    }

    if(!dir) dir = 'unplaced';

    const uri = `https://rhakhis.rbge.info/rhakhis/api/downloads/rss/${dir}/${file}`;

    return (
        <OverlayTrigger
            key="BadgeRssFeed-tooltip-overlay"
            placement="bottom"
            overlay={
                <Tooltip id={`BadgeRssFeed-tooltip-text`}>
                    Experimental link to an RSS Feed for this taxon. Updated daily from October 2025.
                </Tooltip>
            }
        >
            <span
                style={{ float: "right", marginTop: "-.15em" }}
                bg="secondary"
                text="light"
                pill
            >
                <a style={{ textDecoration: "none", paddingRight: ".3em" }} href={uri} target="feed" ><img src="feed-icon.png" height="18px" alt="RSS Feed Icon"></img></a>

            </span>
        </OverlayTrigger>
    );

}
export default BadgeRssFeed;