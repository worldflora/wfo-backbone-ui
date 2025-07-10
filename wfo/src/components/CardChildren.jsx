import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import { useQuery, gql } from "@apollo/client";
import Alert from "react-bootstrap/Alert";
import CardChildrenModal from "./CardChildrenModal"; 

const CHILDREN_QUERY = gql`
  query getChildren($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            fullNameString,
            nameString,
            genusString,
            wfo,
            rank{
                id,
                name,
                isBelowGenus
            }
            taxonPlacement{
                id,
                canEdit,
                acceptedName{
                    id,
                    rank{
                        id,
                        name,
                        isBelowGenus
                    }
                },
                children{
                    id,
                    fullNameString(abbreviateGenus: true),
                    acceptedName{
                        id,
                        wfo,
                        fullNameString(abbreviateGenus: true),
                        nameString,
                        rank{
                            id,
                            name,
                            plural,
                            isBelowGenus
                        }
                    }
                }
            }
        }
    }
`;

function CardChildren(props) {

    const { loading, data } = useQuery(CHILDREN_QUERY, {
        variables: { wfo: props.wfo }
    });

    let children = []; // default to none
    let name = data ? data.getNameForWfoId : null;
    let taxon = null;

    // are we an accepted name in the taxonomy
    if (name && name.taxonPlacement && name.taxonPlacement.acceptedName && name.taxonPlacement.acceptedName.id === name.id) {
        taxon = name.taxonPlacement;
        children = taxon.children;
    }


    // what is the header and do we have mixed ranks?
    let header = [];
    let rankNames = [];
    let rankKids = [];
    let warningLevel = "secondary";
    let alert = null;

    if (children && children.length > 0) {

        children.map(kid => {
            if (rankNames.includes(kid.acceptedName.rank.name)) {
                rankKids[kid.acceptedName.rank.name].push(kid);
            } else {
                rankNames.push(kid.acceptedName.rank.name);
                rankKids[kid.acceptedName.rank.name] = [kid];
            }
            return true;
        });

    } else {
        // no children no render
        return null;
    }

    // check for autonyms
    if (name.rank.name === 'genus' || name.rank.isBelowGenus) {

        let autonymFound = false;

        // work through the kids and check there is one with our name
        for (let i = 0; i < children.length; i++) {
            const kid = children[i];
            if (kid.acceptedName.nameString.toLowerCase() === name.nameString.toLowerCase()) {
                autonymFound = true;
                break;
            }
        }

        if (!autonymFound) {
            warningLevel = "danger";
            alert = <Alert variant={warningLevel}><strong>Missing Autonym:</strong> The code specifies that there should be an autonym in this list.</Alert>
        }

    }

    // check for mixed ranks
    if (rankNames.length > 1) {
        warningLevel = "danger";
        alert = <Alert variant={warningLevel}><strong>Mixed Ranks:</strong> Best practice is that descendants should all be at the same rank.</Alert>
    } else {
        // we only have a single rank
        // if it is 'species' we can cancel any autonym alert
        if (rankNames[0] === 'species') {
            warningLevel = "secondary";
            alert = null;
        }
    }


    // for each rank we output a title and count
    // but we use a component for this which can fire 
    // a modal for them to move the children - if appropriate
    for (let i = 0; i < rankNames.length; i++) {

        header.push(
            <CardChildrenModal name={name} rank={rankNames[i]} key={i} warningLevel={warningLevel} children={rankKids[rankNames[i]]} />
        );

    }

    function renderChildren() {

        if (children && children.length > 0) {
            return children.map((kid) => {

                let button = null;

                if (rankNames.length > 1) {
                    button = <span key={kid.id + '_bspan'} style={{
                        fontSize: "80%",
                        verticalAlign: "super"
                    }} >{' '}<Badge key={kid.id + '_button'} pill bg={warningLevel} >{kid.acceptedName.rank.name}</Badge></span>
                }

                return (
                    <ListGroup.Item
                        action
                        key={kid.id}
                        onClick={(e) => { e.preventDefault(); window.location.hash = kid.acceptedName.wfo; }}
                    >
                        <span key={kid.id + '_name_span'} dangerouslySetInnerHTML={{ __html: kid.fullNameString }} />
                        {button}
                    </ListGroup.Item>
                )
            });
        } else {
            return (<ListGroup.Item key="12345" >No sub-taxa</ListGroup.Item>);
        }

    }

    // finally render it

    if (loading) {
        return (
            <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
                <Card.Header>
                    {header}
                </Card.Header>
                <Card.Body>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card bg="warning" className="wfo-child-list" style={{ marginBottom: "1em" }}>
            <Card.Header>{header}</Card.Header>
            {alert}
            <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto" }} >
                {renderChildren(children)}
            </ListGroup>
        </Card>
    );

}
export default CardChildren;