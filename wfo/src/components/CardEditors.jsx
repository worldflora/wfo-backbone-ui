import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import { useQuery, useLazyQuery, gql } from "@apollo/client";

const EDITORS_QUERY = gql`
   query getEditors($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            canEdit,
            isCurator,
            editors{
                id,
                name,
                orcid
            },
            curators{
                id
            },
            taxonPlacement{
                id,
                acceptedName{
                    id
                }
            }
        }
    }
`;

const POSSIBLE_EDITORS_QUERY = gql`
   query getPossibleEditors{
        getPossibleEditors{
            id,
            name,
            orcid
        }
    }
`;

function CardEditors(props) {

    const { data } = useQuery(EDITORS_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [getPossibleEditors, { data: possiblesData }] = useLazyQuery(POSSIBLE_EDITORS_QUERY);

    const [hidePossibleEditors, setHidePossibleEditors] = useState(true);

    // do nothing if we don't have a name to play
    let name = data ? data.getNameForWfoId : null;
    if (!name) return null;

    let editorList = <ListGroup.Item>None</ListGroup.Item>;
    if (name.editors.length > 0) {
        editorList = [];
        name.editors.map(user => {

            // is this user an editor or curator of this taxon?
            let isCurator = false;
            name.curators.map(curator => {
                if (curator.id === user.id) isCurator = true;
                return true;
            });

            let statusBadge = <Badge pill bg="light" text="dark" >Editor</Badge>
            let removeBadge = null;
            if (isCurator) {
                statusBadge = <Badge pill bg="success" >Curator</Badge>;
                if (name.canEdit) {
                    removeBadge = <Badge pill bg="danger" onClick={() => console.log("bye bye")} >Remove</Badge>;
                }
            }

            editorList.push(
                <ListGroup.Item key={user.id}>
                    <a href={'https://orcid.org/' + user.orcid} target="orcid" >{user.name}</a>
                    <span style={{
                        fontSize: "80%",
                        verticalAlign: "super"
                    }} >{' '}{statusBadge}{' '}{removeBadge}</span>
                </ListGroup.Item>
            );
            return true;
        });
    }

    let editorsOptions = null;
    console.log(possiblesData);
    if (possiblesData && possiblesData.getPossibleEditors) {
        editorsOptions = [];
        possiblesData.getPossibleEditors.map(ed => {

            let disabled = false;

            name.editors.map(user => {
                if (user.id === ed.id) disabled = true;
                return true;
            });

            editorsOptions.push(<option disabled={disabled} key={ed.id}>{ed.name}</option>);
            return true;
        })

    }

    let possiblesComponent = null;
    // we can add curators if we can edit and if this isn't a synonym
    if (name.canEdit && name.id === name.taxonPlacement.acceptedName.id) {

        if (hidePossibleEditors || !possiblesData) {
            possiblesComponent =
                <Card.Body style={{ backgroundColor: "white", padding: "0.2em" }}>
                    <Button variant="outline-dark" size="sm"
                        onClick={e => {
                            getPossibleEditors();
                            setHidePossibleEditors(false);
                        }}

                        style={{ float: "right", marginRight: '0em', marginBottom: '0em' }
                        } >
                        Add Curator
                    </Button >
                </Card.Body>;
        } else {
            possiblesComponent =
                <Card.Body style={{ backgroundColor: "white", padding: "0.2em" }}>
                    <Form.Select onChange={e => setHidePossibleEditors(true)}>
                        <option key="trigger">-- Select Curator --</option>
                        {editorsOptions}
                    </Form.Select>
                </Card.Body>;
        }

    }


    return (
        <Card bg="light" text="dark" style={{ marginBottom: "1em", maxHeight: "50em", overflow: "auto", backgroundColor: "white" }}>
            <Card.Header>Editors</Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: "50em", overflow: "auto", marginBottom: 'none' }} >
                {editorList}
            </ListGroup>
            {possiblesComponent}
        </Card>

    );

}
export default CardEditors;
