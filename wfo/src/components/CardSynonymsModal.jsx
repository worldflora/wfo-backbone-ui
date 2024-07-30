import React from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import { useQuery, gql, useMutation } from "@apollo/client";

const ACCEPTED_NAMES_QUERY = gql`
query getSynonymMover($wfo: String!  $filter: String ){
    getSynonymMover(id: $wfo filter: $filter){
        filter,
        possibleTaxa{
            id,
            canEdit,
            acceptedName{
                id,
                canEdit,
                wfo,
                fullNameString
            }
        }
    }
}
`;



function CardSynonymsModal(props) {

    const [modalShow, setModalShow] = React.useState(false);
    const [actionType, setActionType] = React.useState("none");
    const [filterValue, setFilterValue] = React.useState("");
    const [selectedTaxon, setSelectedTaxon] = React.useState(null);

    const {data, refetch } = useQuery(ACCEPTED_NAMES_QUERY, {
        variables: { wfo: props.name.wfo, filter: '' }
    });

    let spinner = null;

    function hide() {
        resetValues();
        setModalShow(false);
    }

    function show() {
        resetValues();
        setModalShow(true);
    }

    function save() {
        hide();
    }


    function resetValues(){
        setActionType('none');
        setFilterValue('');
        setSelectedTaxon(null);
    }


    function getUnplacingMessage() {
        if (actionType !== 'unplace') return null;
    
        return (
            <>
            <hr/>
                <p style={{ marginTop: '1em', marginBottom: '1em', textAlign: 'right' }} >
                    {props.synonyms.length.toLocaleString()} synonyms will become unplaced names.
                </p>
            </>
        )
    }

    function getAcceptedTaxonPicker(){
        if (actionType !== 'move') return null;

        let listItems = <ListGroup.Item key="0">Nothing found</ListGroup.Item>;
        if(data && data.getSynonymMover && data.getSynonymMover.possibleTaxa){
            listItems = data.getSynonymMover.possibleTaxa.map(taxon => {
                let displayName = <span dangerouslySetInnerHTML={{ __html: taxon.acceptedName.fullNameString }} />

                // we take a different approach to taxa we can edit and those we can't
                if (taxon.canEdit){
                    return(
                         <ListGroup.Item 
                            key={taxon.id}
                            action
                            disabled={false}
                            onClick={(e) => { e.preventDefault(); setSelectedTaxon(taxon); }}    
                        >
                        {displayName} <span style={{ fontSize: '80%' }}>{taxon.acceptedName.wfo}</span>
                        </ListGroup.Item>
                    )
                }else{
                    return (
                        <ListGroup.Item
                            key={taxon.id} 
                            action
                            disabled={true}
                            >
                            <div style={{ float: 'right' }}>🚫</div>
                            {displayName} <span style={{ fontSize: '80%'}}>{taxon.acceptedName.wfo}</span>
                        </ListGroup.Item>
                    )
                }

                
            });
        }

        let listMessage = "You can only move the synonyms to taxa that you have permission to edit.";
        if (selectedTaxon){
            listMessage = <>Move all synonyms to  <strong><span dangerouslySetInnerHTML={{ __html: selectedTaxon.acceptedName.fullNameString }} /></strong></>;
        }

        return (
            <>
            <Form.Group controlId="filterDestinations" style={{ marginTop: "1em" }}>
                    <Form.Control type="text" placeholder="Type the beginning of the accepted name" autoFocus={true} name="filterBox" onChange={handleFilterChange} />
            </Form.Group>
            <ListGroup variant="flush" style={{ height: "20em", overflow: "auto", marginTop: "1em" }}  >
                {listItems}
            </ListGroup>
            <hr/>
                <p style={{ marginTop: '1em', marginBottom: '1em', textAlign: 'right' }} >
                    {listMessage}
                </p>
                
            </>
        ); 
    }

    function handleSelectedActionChange(e){
        setActionType(e.target.value);
        setSelectedTaxon(null);

        if (e.target.value === 'move'){
            refetch({
                wfo: props.name.wfo,
                filter: filterValue
            });
        }

    }

    function handleFilterChange(e) {

        setFilterValue(e.target.value);
        setSelectedTaxon(null);

        // we wait a second after they stop typing
        let typingTimer = null;
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            refetch({
                wfo: props.name.wfo,
                filter: e.target.value
            })
        }, 500);
    }

    function getSaveDisabled(){
        if(actionType === 'unplace') return false;
        if(selectedTaxon) return false;
        return true;
    }


    const badgeStyle = {
        fontSize: "80%",
        verticalAlign: "super",
        cursor: "pointer"
    };

    if(!props.synonyms) return null;

    let displayName = <span dangerouslySetInnerHTML={{ __html: props.name.fullNameString }} />

    return (
        <>
            <span style={badgeStyle} >{' '}
                <Badge pill bg="secondary" onClick={(show)}>{props.synonyms.length.toLocaleString()}</Badge>
            </span>
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
                            Move or remove all synonyms.
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            This will affect all {props.synonyms.length.toLocaleString()} synonyms of {displayName} <strong>This acton cannot be undone.</strong></p>
                        <Form.Group controlId="actionSelect" style={{ marginTop: "1em" }}>
                            <Form.Select name="actionSelect" value={actionType} disabled={false} onChange={handleSelectedActionChange} >
                                <option value="none">-- Select action --</option>
                                <option value="unplace">Unplace: Remove all the synonyms from the classification entirely.</option>
                                <option value="move">Move: Pick a new accepted name from a list.</option>
                            </Form.Select>
                        </Form.Group>
                        {getUnplacingMessage()}                   
                        {getAcceptedTaxonPicker()}
                    </Modal.Body>
                    <Modal.Footer>
                        {spinner}
                        <Button onClick={hide}>Cancel</Button>
                        <Button onClick={save} disabled={getSaveDisabled()}>Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );


}
export default CardSynonymsModal;