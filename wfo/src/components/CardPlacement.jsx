import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import { useQuery, gql, NetworkStatus, useMutation } from "@apollo/client";
import ListGroupItem from "react-bootstrap/esm/ListGroupItem";

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
                wfo,
                fullNameString
            }
        }
        name{
            id,
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
    const [selectedAction, setSelectedAction] = useState('none');

    const { loading, data, refetch, networkStatus } = useQuery(PLACEMENT_QUERY, {
        variables: { wfo: props.wfo, action: 'none', filter: '' },
        notifyOnNetworkStatusChange: true
    });

    const [updatePlacement, { loading: mLoading }] = useMutation(UPDATE_PLACEMENT, {
        refetchQueries: [
            PLACEMENT_QUERY, // run this query again
            'getPlacementInfo', // Query name
            'getHeaderInfo',
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

    // console.log(data);

    // if we have moved then we zero everything.
    if (wfo !== props.wfo) {
        setWfo(props.wfo);
        setFilter('');
        setSelectedAction('none');
    }

    let placer = data ? data.getNamePlacer : null;

    if (placer) {

        // we render nothing if we are an autonym because our placement 
        // is handled automatically
        if (placer.name.nameString === placer.name.speciesString && !placer.name.authorsString) return null;

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

    }

    if (!placer) {
        return (
            <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
                <Card.Header>Placement</Card.Header>
                <Card.Body>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Card.Body>
            </Card>
        );
    }

    let possibleTaxaList = null;
    let filterBox = null;
    if (selectedAction !== 'none' && selectedAction !== 'remove') {

        // do we need to add a filter control?
        if (placer.filterNeeded || placer.filter) {
            filterBox =
                <Form.Group controlId="filterBox" style={{ marginTop: "1em" }}>
                    <Form.Control type="text" placeholder="Type beginning of name" autoFocus={true} name="filterBox" value={filter} onChange={handleFilterChange} />
                </Form.Group>;
        }

        if (placer.possibleTaxa.length > 0) {
            possibleTaxaList =
                <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto" }} >
                    {
                        placer.possibleTaxa.map((t, i) => {
                            return <ListGroupItem
                                key={i}
                                action
                                onClick={(e) => { e.preventDefault(); handleItemSelect(t); }}>
                                <span dangerouslySetInnerHTML={{ __html: t.acceptedName.fullNameString }} />
                            </ListGroupItem>
                        })
                    }
                </ListGroup>
        } else {
            possibleTaxaList =
                <ListGroup variant="flush" style={{}} >
                    <ListGroupItem key="1">
                        Nothing found
                    </ListGroupItem>
                </ListGroup>

        }

    }

    if (loading || mLoading || networkStatus === NetworkStatus.refetch) {
        possibleTaxaList =
            <Card.Text style={{}}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Card.Text>
    }

    return (
        <Card bg="warning" className="wfo-placement" style={{ marginBottom: "1em" }}>
            <Card.Header>Placement</Card.Header>
            <Card.Body style={{ maxHeight: "50em", overflow: "auto", backgroundColor: "white", paddingBottom: "1em" }} >
                <Form>
                    <Form.Group controlId="placementAction" >
                        <Form.Select name="placementActions" disabled={false} value={selectedAction} onChange={handleSelectedActionChanged}>
                            <option value="none">-- Choose action --</option>
                            <option disabled={!placer.canBeRaised} value="raise" >Raise to accepted taxon within ... </option>
                            <option disabled={!placer.canBeSunk} value="sink" >Sink into synonymy within ... </option>
                            <option disabled={!placer.canChangeParent} value="change_parent"  >Change parent taxon to ...</option>
                            <option disabled={!placer.canChangeAccepted} value="change_accepted" >Change to synonym of ...</option>
                            <option disabled={!placer.canBeRemoved} value="remove" >Remove from taxonomy.</option>
                        </Form.Select>
                    </Form.Group>
                    {filterBox}
                </Form>

            </Card.Body>
            {possibleTaxaList}
        </Card >
    );

}
export default CardPlacement;
