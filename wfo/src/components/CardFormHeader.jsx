import React from "react";
import Card from "react-bootstrap/Card";
import { useQuery, gql } from "@apollo/client";

const HEADER_QUERY = gql`
  query getHeaderInfo($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            fullNameString,
            taxonPlacement{
                id,
                rank{
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

    function getCardHeader() {

        if (name && name.taxonPlacement) {
            // the name has a placement in the taxonomy.

            if (name.status === 'deprecated') {
                return (<Card.Header>Deprecated Name</Card.Header>);
            }

            if (name.taxonPlacement.acceptedName.id === name.id) {
                // the name is the accepted name of the taxon it is placed in
                // we are displaying a taxon!
                let displayRank = name.taxonPlacement.rank.name.charAt(0).toUpperCase() + name.taxonPlacement.rank.name.slice(1);
                return (<Card.Header>{displayRank}</Card.Header>);

            } else {
                // the name is not the accepted name of the taxon it is placed in
                // we are displaying a synonym!
                return (<Card.Header>Synonymous Name</Card.Header>);
            }


        }

        return (<Card.Header>Unplaced Name</Card.Header>);

    }

    function getHeadline() {

        if (name) {
            return (<span dangerouslySetInnerHTML={{ __html: name.fullNameString }} />);
        }

        return "No Name";

    }

    // finally render it

    return (
        <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
            {getCardHeader()}

            <Card.Body>
                <h2>{getHeadline()}</h2>
            </Card.Body>
        </Card>
    );

}
export default CardFormHeader;