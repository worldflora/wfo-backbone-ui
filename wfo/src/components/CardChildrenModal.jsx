import React from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import ListGroup from "react-bootstrap/ListGroup";
import InputGroup from "react-bootstrap/InputGroup";
import { useLazyQuery, gql, useMutation } from "@apollo/client";

/*
    Renders a badge that can be clicked on to move 
    children of taxa where moving them does not 
    affect the their name parts
*/

const GET_CHILD_MOVER_QUERY = gql`
query getChildMover($wfo: String! $filter: String $rank: String $limit: Int){
    getChildMover(id: $wfo filter: $filter rank: $rank limit: $limit){
        possibleParentRanks
        requiredGenusString
        requiredSpeciesString
        filter
        possibleTaxa{
            id
            canEdit
            acceptedName{
                id
                wfo
                nameString
                fullNameString
            }
        }
    }
}
`;

const MOVE_CHILDREN_MUTATION = gql`
        mutation  moveChildren(
            $oldParentWfo: String!,
            $childrensRank: String,
            $newParentWfo: String
            ){
          moveChildren(
              oldParentWfo: $oldParentWfo,
              childrensRank: $childrensRank,
              newParentWfo: $newParentWfo
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

function CardChildrenModal(props) {

    const [modalShow, setModalShow] = React.useState(false);
    const [filterValue, setFilterValue] = React.useState("");
    const [selectedTaxon, setSelectedTaxon] = React.useState(null);
    const [excludedChildren, setExcludedChildren] = React.useState([]);
    const [errorMessage, setErrorMessage] = React.useState(null);

    const [getPotentialParentData, {loading, error, data, refetch }] = useLazyQuery(GET_CHILD_MOVER_QUERY, {
        variables: { wfo: props.name.wfo, filter: '' }
    });

    const [moveChildren] = useMutation(MOVE_CHILDREN_MUTATION, {
        refetchQueries: [
            'getChildMover',
            'getChildren' // Query name
        ],
        update: (cache, mutationResult) => {
            // after we have moved something we need to invalidate
            // the cache of the source and destination taxa
            if (mutationResult.data.moveChildren.success){
                mutationResult.data.moveChildren.taxonIds.map(tid => {
                    cache.data.delete('TaxonGql:' + tid);
                    return true;
                });
                 hide();
            }
        }
    });

    function hide() {
        resetValues();
        setModalShow(false);
    }

    function show() {
        resetValues();
        const variables = {filterValue: filterValue, wfo: props.name.wfo, rank:props.rank, limit: 100};
        getPotentialParentData({variables: variables});
        setModalShow(true);
    }

    function save() {
        moveChildren(
            {
                variables: {
                    oldParentWfo: props.name.wfo,
                    childrensRank: props.rank,
                    newParentWfo: selectedTaxon ? selectedTaxon.acceptedName.wfo : null
                }
            }
        );
    }

    /**
     * Toggles the exclusion of a child
     * @param {
     * } child 
     */
    function excludeChild(child){
        const index = excludedChildren.indexOf(child.id);
        if (index > -1) { // only splice array when item is found
            excludedChildren.splice(index, 1); // 2nd parameter means remove one item only
        }else{
            excludedChildren.push(child.id);
        }
        setExcludedChildren(excludedChildren.slice());
    }

    function resetValues(){
        setFilterValue('');
        setSelectedTaxon(null);
        setErrorMessage(null);
    }

    function getAcceptedTaxonPicker(){

        // if we have already picked a taxon then we display it rather than display a list
        if(selectedTaxon){
            return (
                <div>
                    <span style={{float: 'right', marginTop: "-2.3em"}} >
                        <Button variant="outline-secondary" size="sm" onClick={() => setSelectedTaxon(null)}>Deselect</Button>
                    </span>
                 <span dangerouslySetInnerHTML={{ __html: selectedTaxon.acceptedName.fullNameString }} />
                    
                </div>
            );
            
        }

        let listItems = <ListGroup.Item key="0">Nothing found</ListGroup.Item>;
        if(data && data.getChildMover && data.getChildMover.possibleTaxa){
            listItems = data.getChildMover.possibleTaxa.map(taxon => {
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

        let list = 
        <>   
            <ListGroup variant="flush" style={{ height: "20em", overflow: "auto", marginTop: "1em" }}  >
                {listItems}
            </ListGroup>
        </>

        if(data && data.getChildMover.possibleTaxa.length < 1){
            list = <ListGroup variant="flush" style={{ height: "20em", overflow: "auto", marginTop: "1em" }}  >
                    <ListGroup.Item>
                       <strong>~ There are no matching potential new parent taxa. ~</strong> 
                    </ListGroup.Item>
                    </ListGroup>;
        }

        return (
            <>
            <p>
                You can only move these taxa to a new parent that has a rank of {possibleRanks} {requiredGenusString} {requiredSpeciesString}
                You must have permission to edit the new parent.
            </p>
            <Form.Group controlId="filterDestinations" style={{ marginTop: "1em" }}>
                <Form.Control type="text" placeholder="Type the beginning of the new parent's name to filter" autoFocus={true} name="filterBox" onChange={handleFilterChange} />
            </Form.Group>
            {list}
            </>
        ); 
    }

    function getChildrenPicker(){
        if(selectedTaxon){
            let listItems = <ListGroup.Item key="0">No children found</ListGroup.Item>;
            if (props.children && props.children.length > 0) {
                listItems = props.children.map(taxon => {
                    let displayName = <span dangerouslySetInnerHTML={{ __html: taxon.acceptedName.fullNameString }} />
                    // we take a different approach to taxa we can edit and those we can't
                    return (
                        <ListGroup.Item
                            key={taxon.id}
                            action
                            disabled={false}
                            onClick={(e) => { e.preventDefault(); excludeChild(taxon); }}
                            style={{textDecoration: excludedChildren.indexOf(taxon.id) > -1 ? 'line-through' : 'none'}}
                        >
                        {displayName} <span style={{ fontSize: '80%' }}>{taxon.acceptedName.wfo}</span>            
                        </ListGroup.Item>
                    )
                }
                );
            }

            return (
                <>
                <span style={{float: 'right', marginTop: "-2.3em"}} >
                    &nbsp;<Button variant="outline-secondary" size="sm" onClick={() => setSelectedTaxon(null)}>Include all</Button>
                    &nbsp;<Button variant="outline-secondary" size="sm" onClick={() => setSelectedTaxon(null)}>Exclude all</Button>
                </span>
                <span>Click child taxa to exclude them.</span>

                <ListGroup variant="flush" style={{ height: "27em", overflow: "auto", marginTop: "1em" }}  >
                       {listItems}
                </ListGroup>
                </>
            );
        }else{
           return <p>Pick a new parent first.</p>;
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
        if(selectedTaxon) return false;
        return true;
    }

    // give up if no children to display no badge even
    if(props.children.length < 1) return null;


    // set up a counter badge
    const badgeStyle = {
        fontSize: "80%",
        verticalAlign: "super"
    };

    // create the badge that will be the trigger for the modal
    let pill = <Badge pill bg="secondary">{props.children.length.toLocaleString()}</Badge>;
    let toolTip = <>{props.rank} within this {props.name.rank.name}. These can't be moved en masse.</>;
    

    // if they have edit rights to the taxon then we display the pill as clickable
    // whether there is anywhere to move the children or not is calculated only only
    // on the launch of the modal
    if (
        props.name.taxonPlacement  // we are looking at a taxon
        && 
        props.name.taxonPlacement.canEdit // we can edit it
    ) {
        badgeStyle.cursor = "pointer";
        pill = <Badge pill bg="primary" onClick={(show)}>{props.children.length.toLocaleString()}</Badge>;
        toolTip = <>{props.rank} within this {props.name.rank.name}. Click the blue badge to move them en masse.</>;
    }

     let badge =

        <OverlayTrigger
            key="CardChildren-tooltip-overlay"
            placement="top"
            overlay={
                <Tooltip id={`CardChildren-tooltip-text`}>
                    {toolTip}
                </Tooltip>
            }
        ><span> <span key={props.key}>
            {props.rank}
            <span style={badgeStyle} >{' '}{pill}</span>
            {" "}
        </span></span>
        </OverlayTrigger> ;

        let possibleRanks = '';
        if(data){
            possibleRanks = '<strong>' + data.getChildMover.possibleParentRanks.join('</strong> or <strong>') + '</strong>';
            possibleRanks = <span dangerouslySetInnerHTML={{ __html: possibleRanks }} />
            
        } 
        if(error) console.log(error);

        let requiredGenusString = '';
        if(data && data.getChildMover.requiredGenusString) requiredGenusString = 
            <span> and that is a genus called <strong>{data.getChildMover.requiredGenusString}</strong> or is part of a genus
            called <strong>{data.getChildMover.requiredGenusString}</strong></span>;

        let requiredSpeciesString = '';
        if(data && data.getChildMover.requiredSpeciesString) requiredSpeciesString = 
            <span> and that is a species called <strong>{data.getChildMover.requiredSpeciesString}</strong> or is part of a species
            called <strong>{data.getChildMover.requiredSpeciesString}</strong></span>;

    let oldParentDisplayName = <span dangerouslySetInnerHTML={{ __html: props.name.fullNameString }} />

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
                            Move child taxa of rank <strong>{props.rank}</strong> from {oldParentDisplayName}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h3>1. Select new parent taxon</h3>
                        {getAcceptedTaxonPicker()}
                        <hr/>
                        <h3>2. Children to move</h3>
                        {getChildrenPicker()}
                    </Modal.Body>
                    <Modal.Footer>
                        <span style={{color: "red"}} ><strong>Take care!</strong> This action cannot be undone.</span>
                        <Button onClick={hide}>Cancel</Button>
                        <Button onClick={save} disabled={getSaveDisabled()}>Move</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );

}
export default CardChildrenModal;