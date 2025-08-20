import React from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import { useLazyQuery, gql } from "@apollo/client";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";

/*
    renders a badge that can be clicked on to move
    or remove the synonyms of a taxon by displaying
    a modal.
*/

const FULL_SYNONYMY_QUERY = gql`
  query getFullSynonymy($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            basionym{
                id,
                wfo,
                fullNameString
            },
            homotypicNames{
                id,
                wfo,
                fullNameString,
                basionym{
                    id,
                    wfo,
                    fullNameString
                }
                taxonPlacement{
                    id,
                    acceptedName{
                        id,
                        wfo,
                        fullNameString
                    }
                }
            },
            fullNameString,
            taxonPlacement{
                id,
                acceptedName{
                    id
                },
                synonyms{
                    id,
                    wfo,
                    fullNameString,
                    basionym{
                        id,
                        wfo,
                        fullNameString
                    },
                    homotypicNames{
                        id,
                        wfo,
                        fullNameString,
                        basionym{
                            id,
                            wfo,
                            fullNameString
                        }
                        taxonPlacement{
                            id,
                            acceptedName{
                                id,
                                wfo,
                                fullNameString
                            }
                        }
                    },
                    taxonPlacement{
                        id,
                        acceptedName{
                            id,
                            wfo,
                            fullNameString
                        }
                    }
                }
            }
        }
    }
`;

function CardSynonymsFullModal(props) {

    const [modalShow, setModalShow] = React.useState(false);
    const [loadSynonyms, {data}] = useLazyQuery(FULL_SYNONYMY_QUERY, {variables: { wfo: props.name.wfo }});

    function hide() {
        setModalShow(false);
    }

    function show() {
        setModalShow(true);
        loadSynonyms();
    }

    // get the pretty name
    let displayName = <span dangerouslySetInnerHTML={{ __html: props.name.fullNameString }} />

   // console.log(data.getNameForWfoId.taxonPlacement.synonyms);

    const synonymList = [];

    // we create a map keyed on the basionyms
    const homotypicGroups = new Map();
    if(data){

        addToGroupsMap(homotypicGroups, data.getNameForWfoId);

        // add the homotypic names associated with the main name
        // just incase we missed any adding just the name
        data.getNameForWfoId.homotypicNames.map(homo => {
            addToGroupsMap(homotypicGroups, homo);
        });

        // do the same again for everything in the synonyms list
        data.getNameForWfoId.taxonPlacement.synonyms.map(syn => {
            addToGroupsMap(homotypicGroups, syn);

            // add the homotypic names associated with each synonym
            // just incase we missed any adding just the name
            syn.homotypicNames.map(homo => {
                addToGroupsMap(homotypicGroups, homo);
            });

        })

        //console.log(homotypicGroups);

        // we run through this map and write them out as groups
        let first = true;
        homotypicGroups.forEach((name, id) => {
            if(first){
                // start with the accepted anme
                renderName(data.getNameForWfoId, false, false);

                // the first one will be the group containing the accepted name we are on
                if(id == data.getNameForWfoId.id){
                    // the accepted name is basal so just output the combinations as 
                    // homotypic names
                    name.combinations.forEach(comb => {
                        renderName(comb, true, true);
                    })
                }else{
                    // the accepted name is one of the combinations so ..

                    // then the basionym
                    renderName(name, true, true);

                    // output the combinations but skip the accepted name
                    name.combinations.forEach(comb => {
                        if(comb.id != data.getNameForWfoId.id)
                        renderName(comb, true, true);
                    })

                }
                first = false;
            }else{
                // subsequent ones are heterotypic synonyms
                renderName(name, true, false);
                name.combinations.forEach(comb => {
                    renderName(comb, true, true);
                })
            }
            
        })
        
    } // have data

    function renderName(name, isSynonym, isHomotypic){

        let fontWeight = 'normal';
        let paddingLeft = '0px';
        let symbol = '';

        if(isSynonym){
            if(isHomotypic){
                paddingLeft = "2em";
                symbol = "≡";
            }else{
                fontWeight = "bold";
                symbol = "="
            }
        }else{
           fontWeight = "bold";
        }

        // work out if we have any messages for them
        let message = "";
        if(name.id != data.getNameForWfoId.id){
            // we are not the accepted name

            // none of the synonyms should be accepted names
            if(name.taxonPlacement){
                if(name.taxonPlacement.acceptedName.id != data.getNameForWfoId.id){
                    message = "This name is wrongly placed";
                }
            }else{
                message = "This name is unplaced.";
            }

        }

        if(message) message = <><span style={{paddingLeft: "0.5em", color: "red"}}>⚠️&nbsp;{message}</span></>;

        const link = "#" + name.wfo;
        synonymList.push(<ListGroupItem
                action
                key={name.id}
                onClick={(e) => { e.preventDefault(); window.location.hash = name.wfo; }}
                style={{paddingLeft: paddingLeft}}>
                    {symbol}&nbsp;<span style={{fontWeight: fontWeight}} dangerouslySetInnerHTML={{ __html: name.fullNameString }} />
                    &nbsp;<span style={{fontSize: "80%"}}>[{name.wfo}]</span>
                    {message}
                </ListGroupItem>)

    }

    function addToGroupsMap(map, name){

        if(name.basionym){

            // is the basionym already in the map?
            if(map.has(name.basionym.id)){

                // the basionym is already there so just add this 
                // as another combination
                const c = new Object();
                c.id = name.id;
                c.fullNameString = name.fullNameString;
                c.wfo = name.wfo;
                c.taxonPlacement = name.taxonPlacement;
                map.get(name.basionym.id).combinations.set(c.id, c);

            }else{

                // the basionym isn't in the map yet so add it
                const b = new Object();
                b.id = name.basionym.id;
                b.fullNameString = name.basionym.fullNameString;
                b.wfo = name.basionym.wfo;
                b.taxonPlacement = name.taxonPlacement;
                b.combinations = new Map();

                // add the accepted name as a combination of the basionym
                const c = new Object();
                c.id = name.id;
                c.fullNameString = name.fullNameString;
                c.wfo = name.wfo;
                c.taxonPlacement = name.taxonPlacement;
                b.combinations.set(c.id, c);

                // put it in our map
                map.set(name.basionym.id, b)
            }

        }else{

            // there is no basionym so this must be a basionym - for now.
            // if we aren't already in the map
            if(!map.has(name.id)){
                const b = new Object();
                b.id = name.id;
                b.fullNameString = name.fullNameString;
                b.wfo = name.wfo;
                b.taxonPlacement = name.taxonPlacement;
                b.combinations = new Map();
                map.set(b.id, b);
            }

        }

    }

    return (
        <>
            <span style={{fontSize: "80%", verticalAlign: "super", cursor: "pointer"}} >{' '}<Badge pill bg="success" onClick={(show)} >Full</Badge></span>
            <Modal
                show={modalShow}
                onHide={hide}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Form noValidate={true}>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Full synonymy
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto" }}>
                            {synonymList}
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={hide}>Close</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );

}
export default CardSynonymsFullModal;