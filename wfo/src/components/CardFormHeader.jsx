import React from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import { useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const HEADER_QUERY = gql`
  query getHeaderInfo($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            fullNameString,
            authorsString,
            taxonPlacement{
                id,
                fullNameString,
                rank{
                    id,
                    name
                }
                acceptedName{
                    id,
                    fullNameString
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

function CardFormHeader(props) {

    const { data } = useQuery(HEADER_QUERY, {
        variables: { wfo: props.wfo }
    });

    let name = data ? data.getNameForWfoId : null;

    // by default it is unplaced
    let header = "Unplaced Name";
    let headline = "";
    let variant = "secondary";
    let text = "light";

    let linkBadge = null;

    // it may be deprecated
    if (name && name.status === 'deprecated') {
        header = "Deprecated Name";
        headline = <span dangerouslySetInnerHTML={{ __html: name.fullNameString }} />;
    }

    if (name) {

        if (name.taxonPlacement) {

            // the name has a placement in the taxonomy.
            // so it gets taxon colouring
            variant = "warning";
            text = "dark";

            if (name.taxonPlacement.acceptedName.id === name.id) {
                // the name is the accepted name of the taxon it is placed in
                // we are displaying a taxon!
                header = name.taxonPlacement.rank.name.charAt(0).toUpperCase() + name.taxonPlacement.rank.name.slice(1);
                headline = <span dangerouslySetInnerHTML={{ __html: name.taxonPlacement.fullNameString }} />;

            } else {
                // the name is not the accepted name of the taxon it is placed in
                // we are displaying a synonym!
                header = "Synonymous Name";
                headline = <span dangerouslySetInnerHTML={{ __html: name.fullNameString }} />;
            }



        } else {

            // the headline comes from the name because we are a synonym or unplaced
            headline = <span dangerouslySetInnerHTML={{ __html: name.fullNameString }} />;

        }

        linkBadge = <Badge
            style={{ float: "right" }}
            bg="secondary"
            text="light"
            pill
        >
            <a style={{ textDecoration: "none", color: "white" }} href={"http://www.worldfloraonline.org/taxon/" + name.wfo}>{name.wfo} ↗</a></Badge>

    }


    // finally render it

    return (
        <Card bg={variant} text={text} className="wfo-child-list" style={{ marginBottom: "1em" }}>
            <Card.Header>
                {linkBadge}
                
                    <OverlayTrigger
                        key="CardFormHeader-tooltip-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`CardFormHeader-tooltip-text`}>
                                The full rendering of this name including the rank and authors. 
                            </Tooltip>
                        }
                    >
                        <span>
                        {header}
                        </span>
                    </OverlayTrigger>
            </Card.Header>
            <Card.Body style={{ backgroundColor: "white", color: "black" }}>
                <h2>{headline}</h2>
            </Card.Body>
        </Card>
    );
 
}
export default CardFormHeader;