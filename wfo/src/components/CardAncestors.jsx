import React from "react";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import { useQuery, gql } from "@apollo/client";


const ANCESTORS_QUERY = gql`
  query getAncestors($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            fullNameString(abbreviateGenus: true, authors: false),
            taxonPlacement{
                id,
                acceptedName{
                    id,
                    wfo,
                    fullNameString(abbreviateGenus: true, authors: false)
                },
                ancestors{
                    id,
                    acceptedName{
                        id,
                        wfo,
                        fullNameString(abbreviateGenus: true, authors: false),
                        nameString
                    }
                }
            }
        }
    }
`;


function CardAncestors(props) {

    const { loading, data } = useQuery(ANCESTORS_QUERY, {
        variables: { wfo: props.wfo }
    });

    let ancestors = []; // none by default
    let name = data ? data.getNameForWfoId : null;

    // if we don't have a place in the taxonomy then don't render at all
    if (name && !name.taxonPlacement) {
        return null;
    }

    // if we don have a place then render
    if (name && name.taxonPlacement) {

        // the name has a placement in the taxonomy.
        ancestors = name.taxonPlacement.ancestors;

        // if the name is a synonym we add the accepted name to the ancestry
        if (name.taxonPlacement.acceptedName.id !== name.id) {
            ancestors = [...ancestors];
            ancestors.unshift(name.taxonPlacement);
        }

    }

    // reverse them so we walk down the ways
    ancestors = [...ancestors].reverse();

    // finally render
    return (

        <Card border="warning" style={{ marginBottom: "1em" }}>
            <Card.Body >
                <Card.Text>
                    <Breadcrumb listProps={{ style: { marginBottom: "0rem" } }} >
                        {renderPath(ancestors)}
                    </Breadcrumb>
                </Card.Text>

            </Card.Body>
        </Card>

    );


    function renderPath(ants) {

        if (loading) {
            return (<Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>)
        }

        if (ants && ants.length > 0) {
            return ants.map((ancestor) => {
                if (ancestor.acceptedName) {
                    return (
                        <Breadcrumb.Item key={ancestor.id} href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ancestor.acceptedName.wfo; }} >
                            <span dangerouslySetInnerHTML={{ __html: ancestor.acceptedName.fullNameString }} />
                        </Breadcrumb.Item>
                    );
                } else {
                    return <Breadcrumb.Item>Home</Breadcrumb.Item>
                }


            });
        } else {
            return <Breadcrumb.Item>No Trail</Breadcrumb.Item>
        }
    }

}
export default CardAncestors;