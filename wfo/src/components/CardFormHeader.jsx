import React from "react";
import Card from "react-bootstrap/Card";
import { useQuery, gql } from "@apollo/client";

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

function CardFormHeader(props) {

    const { data } = useQuery(HEADER_QUERY, {
        variables: { wfo: props.wfo }
    });

    let name = data ? data.getNameForWfoId : null;

    // by default it is unplaced
    let header = <Card.Header>Unplaced Name</Card.Header>;
    let headline = "";
    let variant = "secondary";
    let text = "light";

    // it may be deprecated
    if (name && name.status === 'deprecated') {
        header = <Card.Header>Deprecated Name</Card.Header>
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
                let displayRank = name.taxonPlacement.rank.name.charAt(0).toUpperCase() + name.taxonPlacement.rank.name.slice(1);
                header = <Card.Header>{displayRank}</Card.Header>

            } else {
                // the name is not the accepted name of the taxon it is placed in
                // we are displaying a synonym!
                header = <Card.Header>Synonymous Name</Card.Header>;
            }

            // the headline comes from the taxon
            headline = <span dangerouslySetInnerHTML={{ __html: name.taxonPlacement.fullNameString }} />;

        } else {

            // the headline comes from the name because we are a synonym or unplaced
            headline = <span dangerouslySetInnerHTML={{ __html: name.fullNameString }} />;

        }

    }


    // finally render it

    return (
        <Card bg={variant} text={text} className="wfo-child-list" style={{ marginBottom: "1em" }}>
            {header}
            <Card.Body style={{ backgroundColor: "white", color: "black" }}>
                <h2>{headline}</h2>
            </Card.Body>
        </Card>
    );

}
export default CardFormHeader;