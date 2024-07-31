import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useMutation, useQuery, gql } from "@apollo/client";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import CardNameTypeRelationshipsPick from './CardNameTypeRelationshipsPick';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";



const TYPE_REL_QUERY = gql`
   query getTypeRelationships($wfo: String!){
        getNameForWfoId(id: $wfo) {
            id,
            canEdit,
            wfo,
            fullNameString,
            nameString,
            speciesString,
            authorsString,
            basionym{
                id,
                wfo,
                fullNameString
            }
            homotypicNames{
                id,
                wfo,
                fullNameString
            }
	    }
    }
`;

const UPDATE_BASIONYM = gql`
        mutation  updateBasionym(
            $wfo: String!,
            $basionymWfo: String
            ){
          updateBasionym(
              wfo: $wfo,
              basionymWfo: $basionymWfo
          ){
            name,
            success,
            message,
            children{
              name,
              success,
              message
            },
            taxonIds
          }
        }
`;

function CardNameTypeRelationships(props) {

    const [wfo, setWfo] = useState('');
    const [showPicker, setShowPicker] = useState(false);

    const { data } = useQuery(TYPE_REL_QUERY, {
        variables: { wfo: props.wfo }
    });

    // doing the mutation
    const [updateBasionym] = useMutation(UPDATE_BASIONYM, {
        refetchQueries: [
            'getTypeRelationships'
        ],
        update: (cache) => {
            // after we have moved something we need to invalidate
            // the cache of the source and destination names
            cache.data.delete('NameGql:' + wfo);
            // FIXME destination ?
            setShowPicker(false);
        }
    });


    let name = data ? data.getNameForWfoId : null;

    if (!name) return null;

    // we render nothing if we are an autonym
    if (name.nameString === name.speciesString && !name.authorsString) return null;

    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
        setShowPicker(false);
        //setComment(name.comment === null ? '' : name.comment);
    }


    let basionymListItem = null;


    if (name.basionym) {

        let basionymRemoveBadge = null;
        if (name.canEdit) {
            basionymRemoveBadge =
                <>
                    {' '}
                    <Badge pill bg="danger" onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateBasionym({
                            variables: {
                                wfo: props.wfo,
                                basionymWfo: null
                            }
                        });
                    }}>Remove</Badge>
                </>;
        }


        basionymListItem =
            <ListGroup.Item
                action
                key={name.basionym.id}
                onClick={(e) => { e.preventDefault(); window.location.hash = name.basionym.wfo; }}
            >
                <span dangerouslySetInnerHTML={{ __html: name.basionym.fullNameString }} />
                <span style={{
                    fontSize: "80%",
                    verticalAlign: "super"
                }} >
                    {' '}
                    <Badge pill bg="success" >Basionym</Badge>
                    {basionymRemoveBadge}
                </span>
            </ListGroup.Item >
    }

    let homotypics = [];
    if (name.homotypicNames) {
        name.homotypicNames.map(ht => {
            homotypics.push(
                <ListGroup.Item
                    action
                    key={ht.id}
                    onClick={(e) => { e.preventDefault(); window.location.hash = ht.wfo; }}
                >
                    <span dangerouslySetInnerHTML={{ __html: ht.fullNameString }} />
                </ListGroup.Item>
            );
            return null;
        });
    }

    let basionymAddFormSwitch = null;
    if (!name.basionym && name.homotypicNames.length === 0 && !showPicker) {

        if (name.canEdit) {
            // they get a button if they can edit this name
            basionymAddFormSwitch = <ListGroup.Item
                action
                key="add_bas"
                onClick={(e) => { e.preventDefault(); setShowPicker(true) }}
            >Add Basionym ...</ListGroup.Item>;
        } else {
            // just get a place holder if not
            basionymAddFormSwitch = <ListGroup.Item
                key="add_bas"
            >None set</ListGroup.Item>;
        }

    }

    let basionymAddForm = null;
    if (showPicker) {
        basionymAddForm = <CardNameTypeRelationshipsPick wfo={props.wfo} updateBasionym={updateBasionym} />
    }


    return (
        <Form >
            <Card bg="secondary" text="white" style={{ marginBottom: "1em" }}>
                <Card.Header>
                    <OverlayTrigger
                        key="CardNameTypeRelationships-tooltip-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`CardNameTypeRelationships-tooltip-text`}>
                                Names that share the same type specimen.
                            </Tooltip>
                        }
                    >
                    <span>Homotypic Names</span>
                    </OverlayTrigger>
                </Card.Header>
                <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto" }} >
                    {basionymListItem}
                    {homotypics}
                    {basionymAddFormSwitch}
                </ListGroup>
                {basionymAddForm}
            </Card>
        </Form>

    );

}
export default CardNameTypeRelationships;
