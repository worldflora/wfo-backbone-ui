import React from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";
import { useQuery, gql, useMutation } from "@apollo/client";

/*
    renders a badge that can be clicked on to move
    or remove the synonyms of a taxon by displaying
    a modal.
*/

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

const MOVE_SYNS_MUTATION = gql`
        mutation  moveSynonyms(
            $sourceWfo: String!,
            $destinationWfo: String
            ){
          moveSynonyms(
              sourceWfo: $sourceWfo,
              destinationWfo: $destinationWfo
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

function CardSynonymsMoveModal(props) {

    const [modalShow, setModalShow] = React.useState(false);
    const [actionType, setActionType] = React.useState("none");
    const [filterValue, setFilterValue] = React.useState("");
    const [selectedTaxon, setSelectedTaxon] = React.useState(null);
    const [errorMessage, setErrorMessage] = React.useState(null);

    const {data, refetch } = useQuery(ACCEPTED_NAMES_QUERY, {
        variables: { wfo: props.name.wfo, filter: '' }
    });

    const [moveSynonyms] = useMutation(MOVE_SYNS_MUTATION, {
        refetchQueries: [
            'getSynonyms' // Query name
        ],
        update: (cache, mutationResult) => {
            // after we have moved something we need to invalidate
            // the cache of the source and destination taxa
            if (mutationResult.data.moveSynonyms.success){
                mutationResult.data.moveSynonyms.taxonIds.map(tid => {
                    cache.data.delete('TaxonGql:' + tid);
                    return true;
                });
                hide();
            }else{
                setErrorMessage(mutationResult.data.moveSynonyms.message);
            }
        }   
    });

    function hide() {
        resetValues();
        setModalShow(false);
    }

    function show() {
        resetValues();
        setModalShow(true);
    }

    function save() {
        moveSynonyms(
            {
                variables: {
                    sourceWfo: props.name.wfo,
                    destinationWfo: selectedTaxon ? selectedTaxon.acceptedName.wfo : null
                }
            }
        );
    }

    function resetValues(){
        setActionType('none');
        setFilterValue('');
        setSelectedTaxon(null);
        setErrorMessage(null);
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

    // give up if no synonyms
    if(!props.synonyms) return null;

    // get the pretty name
    let displayName = <span dangerouslySetInnerHTML={{ __html: props.name.fullNameString }} />

    // set up a counter badge
    const badgeStyle = {
        fontSize: "80%",
        verticalAlign: "super"
    };

    let badge = <span style={badgeStyle} >{' '}<Badge pill bg="secondary">{props.synonyms.length.toLocaleString()}</Badge></span>;
    if (props.name.taxonPlacement && props.name.taxonPlacement.canEdit) {
        badgeStyle.cursor = "pointer";
        badge = <span style={badgeStyle} >{' '}<Badge pill bg="primary" onClick={(show)}>{props.synonyms.length.toLocaleString()}</Badge></span>;
    }


    return (
        <>
            {badge}
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
                        <Button onClick={hide}>Cancel</Button>
                        <Button onClick={save} disabled={getSaveDisabled()}>Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );

}
export default CardSynonymsMoveModal;