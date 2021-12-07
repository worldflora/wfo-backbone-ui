import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import { useQuery, gql } from "@apollo/client";

const CHILDREN_QUERY = gql`
  query getChildren($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            taxonPlacement{
                id,
                acceptedName{
                    id
                },
                children{
                    id,
                    acceptedName{
                        id,
                        wfo,
                        fullNameString(abbreviateGenus: true),
                        nameString,
                        rank{
                            name,
                            plural
                        }
                    }
                }
            }
        }
    }
`;

function CardChildren(props) {

    const { loading, error, data } = useQuery(CHILDREN_QUERY, {
        variables: { wfo: props.wfo }
    });

    let children = []; // default to none
    let name = data ? data.getNameForWfoId : null;

    // are we an accepted name in the taxonomy
    if (name && name.taxonPlacement && name.taxonPlacement.acceptedName && name.taxonPlacement.acceptedName.id == name.id) {
        children = name.taxonPlacement.children;
    }

    function renderChildren() {
        if (children && children.length > 0) {
            return children.map((kid) => (
                <ListGroup.Item
                    action
                    key={kid.id}
                    onClick={(e) => { e.preventDefault(); window.location.hash = kid.acceptedName.wfo; }}
                >
                    <span dangerouslySetInnerHTML={{ __html: kid.acceptedName.fullNameString }} />
                </ListGroup.Item>
            ));
        } else {
            return (<ListGroup.Item>No sub-taxa</ListGroup.Item>);
        }
    }

    function getCountBadge() {

        const badgeStyle = {
            fontSize: "80%",
            verticalAlign: "super"
        };

        if (!children) return "";

        return <span style={badgeStyle} >{' '}<Badge pill bg="secondary">{children.length.toLocaleString()}</Badge></span>;
    }

    function getHeader() {

        if (children && children.length > 0) {
            let rank = children[0].acceptedName.rank;
            return rank.plural;
        }

        return "Child Taxa";

    }

    // finally render it

    if (loading) {
        return (
            <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
                <Card.Header>{getHeader()} {getCountBadge()}</Card.Header>
                <Card.Body>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Card.Body>
            </Card>
        );
    }

    if (!children || children.length == 0) return null;

    return (
        <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
            <Card.Header>{getHeader()} {getCountBadge()}</Card.Header>
            <Card.Body>
                <ListGroup>
                    {renderChildren(children)}
                </ListGroup>
            </Card.Body>
        </Card>
    );

}
export default CardChildren;