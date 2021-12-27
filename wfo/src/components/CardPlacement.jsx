import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import { useQuery, gql, NetworkStatus } from "@apollo/client";
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
            genusString,
            speciesString
        }
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

    // console.log(data);

    // if we have moved then we zero everything.
    if (wfo !== props.wfo) {
        setWfo(props.wfo);
        setFilter('');
        setSelectedAction('none');
    }

    let placer = data ? data.getNamePlacer : null;

    if (placer) {

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
        refetch({
            wfo: props.wfo,
            action: e.target.value,
            filter: filter
        });
        setSelectedAction(e.target.value);
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

    // do we need to add a filter control?
    let filterBox = null;
    if (placer.filterNeeded || placer.filter) {
        filterBox =
            <Form.Group controlId="filterBox" style={{ marginTop: "1em" }}>
                <Form.Control type="text" placeholder="Type beginning of name" name="filterBox" value={filter} onChange={handleFilterChange} />
            </Form.Group>;
    }

    let possibleTaxaList = null;
    if (placer.possibleTaxa.length > 0) {
        possibleTaxaList =
            <ListGroup style={{ marginTop: "1em", maxHeight: "30em", overflow: "auto" }} >
                {
                    placer.possibleTaxa.map((t, i) => {
                        return <ListGroupItem key={i}>
                            <span dangerouslySetInnerHTML={{ __html: t.acceptedName.fullNameString }} />
                        </ListGroupItem>
                    })
                }
            </ListGroup>
    }

    if (loading || networkStatus === NetworkStatus.refetch) {
        possibleTaxaList =
            <Card.Text style={{ marginTop: "1em" }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Card.Text>
    }


    return (
        <Card className="wfo-child-list" style={{ marginBottom: "1em" }}>
            <Card.Header>Placement</Card.Header>
            <Card.Body style={{ maxHeight: "50em", overflow: "auto" }} >
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
                {possibleTaxaList}
            </Card.Body>
        </Card >
    );

}
export default CardPlacement;
