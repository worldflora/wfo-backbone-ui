import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useQuery, gql, useMutation } from "@apollo/client";
import CardPlacementFilter from "./CardPlacementFilter";
import CardPlacementList from "./CardPlacementList";


// FIXME: Prevent placing in a taxon you don't own.

const PLACEMENT_QUERY = gql`
  query getPlacementInfo($wfo: String! $action: PlacementAction $filter: String ){
    getNamePlacer(id: $wfo action: $action filter: $filter){
        canBeSunk,
        canBeRaised,
        canBeRemoved,
        canChangeParent,
        canChangeAccepted,
        filterNeeded,
        filter,
        action,
        possibleTaxa{
            id,
            acceptedName{
                id,
                canEdit,
                wfo,
                fullNameString
            }
        }
        name{
            id,
            canEdit,
            fullNameString,
            status,
            nameString,
            genusString,
            speciesString,
            authorsString,
            taxonPlacement{
                id
            }
        }
    }
 }
`;

const UPDATE_PLACEMENT = gql`
        mutation  updatePlacement(
            $wfo: String!,
            $action: PlacementAction!,
            $destinationWfo: String
            ){
          updatePlacement(
              wfo: $wfo,
              action: $action,
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

function CardPlacement(props) {

    // we track the status, genus and species of the name because if they
    // are changed elsewhere in the ui we need to reload
    const [status, setStatus] = useState();
    const [genus, setGenus] = useState();
    const [species, setSpecies] = useState();

    const [wfo, setWfo] = useState();
    const [filter, setFilter] = useState('');
    const [filterNeeded, setFilterNeeded] = useState(false);
    const [possibleTaxa, setPossibleTaxa] = useState([]);
    const [selectedAction, setSelectedAction] = useState('none');

    const { loading, data, refetch } = useQuery(PLACEMENT_QUERY, {
        variables: { wfo: props.wfo, action: 'none', filter: '' },
        notifyOnNetworkStatusChange: true
    });

    const [updatePlacement] = useMutation(UPDATE_PLACEMENT, {
        refetchQueries: [
            PLACEMENT_QUERY, // run this query again
            'getPlacementInfo', // Query name
            'getAncestors'
        ],
        update: (cache, mutationResult) => {
            // after we have moved something we need to invalidate
            // the cache of the source and destination taxa
            mutationResult.data.updatePlacement.taxonIds.map(tid => {
                cache.data.delete('TaxonGql:' + tid);
                return true;
            });
        },
    });

    // if we have moved then we zero everything.
    if (wfo !== props.wfo) {
        setWfo(props.wfo);
        setFilter('');
        setFilterNeeded(false);
        setSelectedAction('none');
    }

    let placer = data ? data.getNamePlacer : null;

    if (placer) {

        // we render nothing if we can't edit the taxon.
        if (!placer.name.canEdit) return null;

        // we render nothing if we are an autonym because our placement 
        // is handled automatically
        if (placer.name.nameString === placer.name.speciesString && !placer.name.authorsString) return null;

        // has the need for a filter changed?
        if (placer.filterNeeded !== filterNeeded) setFilterNeeded(placer.filterNeeded);

        // has the list of taxa changed
        if (!loading) {
            if (placer.possibleTaxa.length !== possibleTaxa.length) {
                setPossibleTaxa(placer.possibleTaxa);
            } else {
                for (let i = 0; i < placer.possibleTaxa.length; i++) {
                    if (placer.possibleTaxa[i].id !== possibleTaxa[i].id) {
                        setPossibleTaxa(placer.possibleTaxa);
                        break;
                    }
                }
            }

        }

        // look for changes in name from somewhere else
        if (
            placer.name.status !== status
            ||
            placer.name.speciesString !== species
            ||
            placer.name.genusString !== genus
        ) {
            setStatus(placer.name.status);
            setSpecies(placer.name.speciesString);
            setGenus(placer.name.genusString);
            refetch({
                wfo: wfo,
                action: selectedAction,
                filter: filter
            });
        }

    }

    function handleSelectedActionChanged(e) {

        // selecting remove fires that item selected
        // with null
        if (e.target.value === 'remove') {
            doAction('remove', null);
            return;
        }

        refetch({
            wfo: props.wfo,
            action: e.target.value,
            filter: filter
        });

        setSelectedAction(e.target.value);
    }

    function handleFilterChange(e) {

        setFilter(e.target.value);

        // we wait a second after they stop typing
        let typingTimer = null;
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            refetch({
                wfo: props.wfo,
                action: selectedAction,
                filter: e.target.value
            })
        }, 1000);
    }

    function handleItemSelect(taxon) {

        doAction(selectedAction, taxon ? taxon.acceptedName.wfo : null);

    }

    function doAction(action, destinationWfo) {

        updatePlacement(
            {
                variables: {
                    wfo: props.wfo,
                    action: action,
                    destinationWfo: destinationWfo
                }
            }
        );

        setPossibleTaxa([]);
        setFilter('');
        setSelectedAction('none');

    }

    return (
        <Card bg="warning" className="wfo-placement" style={{ marginBottom: "1em" }}>
            <Card.Header>Placement</Card.Header>
            <Card.Body style={{ maxHeight: "50em", overflow: "auto", backgroundColor: "white", paddingBottom: "1em" }} >
                <Form>
                    <Form.Group controlId="placementAction" >
                        <Form.Select name="placementActions" disabled={false} value={selectedAction} onChange={handleSelectedActionChanged}>
                            <option value="none">-- Choose action --</option>
                            <option disabled={!placer || !placer.canBeRaised} value="raise" >Raise to accepted taxon within ... </option>
                            <option disabled={!placer || !placer.canBeSunk} value="sink" >Sink into synonymy within ... </option>
                            <option disabled={!placer || !placer.canChangeParent} value="change_parent"  >Change parent taxon to ...</option>
                            <option disabled={!placer || !placer.canChangeAccepted} value="change_accepted" >Change to synonym of ...</option>
                            <option disabled={!placer || !placer.canBeRemoved} value="remove" >Remove from taxonomy.</option>
                        </Form.Select>
                    </Form.Group>
                    <CardPlacementFilter filter={filter} filterNeeded={filterNeeded} handleFilterChange={handleFilterChange} />
                </Form>
            </Card.Body>
            <CardPlacementList selectedAction={selectedAction} possibleTaxa={possibleTaxa} handleItemSelect={handleItemSelect} />
        </Card >
    );

}
export default CardPlacement;
