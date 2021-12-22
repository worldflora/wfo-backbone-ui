import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import { useQuery, gql } from "@apollo/client";
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

    const [status, setStatus] = useState();
    const [genus, setGenus] = useState();
    const [species, setSpecies] = useState();
    const [filter, setFilter] = useState();
    const [selectedAction, setSelectedAction] = useState('none');

    const { loading, error, data, refetch } = useQuery(PLACEMENT_QUERY, {
        variables: { wfo: props.wfo, action: 'none', filter: '' }
    });

    // console.log(data);

    let placer = data ? data.getNamePlacer : null;

    if (placer) {

        if (
            placer.name.status != status
            ||
            placer.name.speciesString != species
            ||
            placer.name.genusString != genus

        ) {
            setStatus(placer.name.status);
            setSpecies(placer.name.speciesString);
            setGenus(placer.name.genusString);
            setSelectedAction(placer.action);
            refetch();
        }

    }

    function handleSelectedActionChanged(e) {
        refetch({
            wfo: props.wfo,
            action: e.target.value,
            filter: filter
        });
    }

    if (!placer || loading) {
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
        console.log(e);
    }

    // do we need to add a filter control?
    let filterBox = null;
    if (placer.filterNeeded) {
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
