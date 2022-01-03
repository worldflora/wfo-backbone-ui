import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import AlertUpdate from "./AlertUpdate";
import { useMutation, useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const NAME_PARTS_QUERY = gql`
  query getNameParts($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            nameString,
            genusString,
            speciesString,
            fullNameString,
            rank{
                name,
                children{
                    name
                }
            },
            taxonPlacement{
                id,
                acceptedName{
                    id
                }
                parent{
                    acceptedName{
                        id,
                        rank{
                            children{
                                name
                            }
                        }
                    }
                }
                children{
                    id
                }
            }
        }
        getAllRanks{
            name,
            plural
            children{
                name,
                plural
            }
        }
    }
`;

const UPDATE_NAME_PARTS = gql`
        mutation  updateNameParts(
            $wfo: String!,
            $rankString: String!,
            $nameString: String!,
            $genusString: String!,
            $speciesString: String!
            ){
          updateNameParts(
              wfo: $wfo,
              nameString: $nameString,
              genusString: $genusString,
              speciesString: $speciesString,
              rankString: $rankString
          ){
            name,
            success,
            message,
            children{
              name,
              success,
              message
            }
          }
        }
`;


function CardNameParts(props) {

    const { loading, data } = useQuery(NAME_PARTS_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updateNameParts, { data: mData, loading: mLoading }] = useMutation(UPDATE_NAME_PARTS, {
        refetchQueries: [
            NAME_PARTS_QUERY, // DocumentNode object parsed with gql
            'getNameParts' // Query name
        ],
    });

    const [wfo, setWfo] = useState();
    const [rankString, setRankString] = useState();
    const [nameString, setNameString] = useState();
    const [genusString, setGenusString] = useState();
    const [speciesString, setSpeciesString] = useState();

    let name = data ? data.getNameForWfoId : null;
    let ranks = data ? data.getAllRanks : [];

    if (!name || !ranks) return null;

    // re-initialise the state if we have a new wfo to render
    if (wfo !== props.wfo) {
        setWfo(props.wfo);
        setRankString(name.rank.name);
        setNameString(name.nameString);
        setGenusString(name.genusString);
        setSpeciesString(name.speciesString);
    }

    function handleRankChange(event) {
        let newRank = event.target.value;
        setRankString(newRank);

        let ns = nameString;
        ns = ns.toLowerCase();

        // uppercase it if we are above species level
        for (var i = 0; i < ranks.length; i++) {

            let rank = ranks[i];

            // stop at species
            if (rank.name === "species") break;

            // found a the rank
            if (rank.name === newRank) {
                ns = ns.charAt(0).toUpperCase() + ns.slice(1);
                break;
            }
        }

        // set it in the new state
        setNameString(ns);

    }

    function handleNameChange(event) {
        let newName = event.target.value;

        // everything is lower cases 
        newName = newName.toLowerCase();

        // we only deal with single words which may (in extremis have hyphens)
        newName = newName.replace(/[^A-Za-z-]/g, '');

        // apart from certain ranks
        for (var i = 0; i < ranks.length; i++) {

            let rank = ranks[i];

            // stop at species
            if (rank.name === "species") break;

            // found a the rank
            if (rank.name === rankString) {
                newName = newName.charAt(0).toUpperCase() + newName.slice(1);
            }

        }

        setNameString(newName);

    }

    function handleGenusChange(event) {

        let newGenus = event.target.value;

        // we only deal with single words which may (in extremis have hyphens)
        newGenus = newGenus.replace(/[^A-Za-z-]/g, '');

        // Genus names are always upper case
        // everything is lower cases 
        newGenus = newGenus.charAt(0).toUpperCase() + newGenus.slice(1).toLowerCase();

        setGenusString(newGenus);

    }

    function handleSpeciesChange(event) {

        let newSpecies = event.target.value;

        newSpecies = newSpecies.toLowerCase();

        // we only deal with single words which may (in extremis have hyphens)
        newSpecies = newSpecies.replace(/[^A-Za-z-]/g, '');

        setSpeciesString(newSpecies);

    }


    function handleSubmit(event) {

        event.preventDefault();

        updateNameParts({
            variables: {
                wfo: wfo,
                rankString: rankString,
                nameString: nameString,
                genusString: genusString,
                speciesString: speciesString
            }
        });

    }


    function renderRank() {

        let help = "The rank selected dictates the meaning of the parts of the name.";
        let disabled = false;

        // are we an accepted taxon
        if (name && name.taxonPlacement && name.taxonPlacement.acceptedName.id === name.id) {

            // if we are a genus or species then people depend on us for their names
            // we can't be changed.
            if (
                (name.rank.name === "genus" || name.rank.name === "species")
                && name.taxonPlacement.children
                && name.taxonPlacement.children.length > 0
            ) {
                help = "The is the name of an accepted " + name.rank.name + " with children whose names depend on it so the rank can't be changed.";
                disabled = true;
            }


        }

        return (

            <OverlayTrigger
                key="rank1"
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-rank1`}>
                        {help}
                    </Tooltip>
                }
            >
                <Form.Group controlId="rank">
                    <FloatingLabel label="Rank">
                        <Form.Select name="rankString" disabled={disabled} value={rankString} onChange={handleRankChange}>
                            {getRanks()}
                        </Form.Select>
                    </FloatingLabel>
                </Form.Group>

            </OverlayTrigger>


        );


    }

    function getRanks() {

        // safety catch for rendering empty
        if (!name || !ranks) return null;

        /*
            So what ranks can be set here?
            if we are unplaced or a synonym then anything!
            if we are an accepted name then only what is permitted below our parents
            and nothing if we have children?
        */

        const options = [];

        for (const idx in ranks) {

            let rank = ranks[idx];
            let disabled = false;

            // if we are an accepted name we disable some ranks
            if (name.taxonPlacement && name.taxonPlacement.acceptedName.id === name.id && name.taxonPlacement.parent.acceptedName) {
                disabled = true;
                name.taxonPlacement.parent.acceptedName.rank.children.map(kidRank => {
                    if (kidRank.name === rank.name) disabled = false;
                    return disabled;
                });
            }

            options.push(
                <option disabled={disabled} value={rank.name} key={rank.name} >{rank.name}</option>
            );
        }

        return options;
    }

    function renderGenus() {

        // we are a genus so we don't have a genus part.
        if (rankString === "genus") return null;

        // work through the other ranks
        for (var i = 0; i < ranks.length; i++) {
            let rank = ranks[i];
            if (rank.name === rankString) return null; // we found our rank
            if (rank.name === "genus") break; // we got to genus so we are good to go
        }

        // if we are part of the taxonomy then we can't be changes.
        let disabled = false;
        let help = "Ranks below genus level have a genus part to the name.";
        if (name.taxonPlacement && name.taxonPlacement.acceptedName.id === name.id && name.taxonPlacement.parent.acceptedName) {
            disabled = true;
            help = "This is the accepted name of a taxon and the genus part therefore has to agree with the genus it is placed in."
        }
        /*
                return (
                    <Form.Group controlId="genus">
                        <Form.Label >Genus Part</Form.Label>
                        <Form.Control disabled={disabled} type="text" placeholder="Genus part of name below genus rank." name="genusString" value={genusString} onChange={handleGenusChange} />
                        <Form.Text className="text-muted">{help}</Form.Text>
                    </Form.Group>
                );
        
                */

        return (
            <OverlayTrigger
                key="genus"
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-genus`}>
                        {help}
                    </Tooltip>
                }
            >
                <Form.Group controlId="genus" style={{ marginTop: "1em" }}>
                    <FloatingLabel label="Genus Part">
                        <Form.Control disabled={disabled} type="text" placeholder="Genus part of name below genus rank." name="genusString" value={genusString} onChange={handleGenusChange} />
                    </FloatingLabel>
                </Form.Group>
            </OverlayTrigger>
        );


    }

    function renderSpecies() {

        // we are a species so we don't have a species part.
        if (rankString === "species") return null;

        // work through the other ranks
        for (var i = 0; i < ranks.length; i++) {
            let rank = ranks[i];
            if (rank.name === rankString) return null; // we found our rank
            if (rank.name === "species") break; // we got to species so we are good to go
        }

        // if we are part of a 
        let disabled = false;
        let help = "Ranks below species level have a Species Part to the name.";
        if (name.taxonPlacement && name.taxonPlacement.acceptedName.id === name.id && name.taxonPlacement.parent.acceptedName) {
            disabled = true;
            help = "This is the accepted name of a taxon and the Species Part therefore has to agree with the species it is placed in."
        }

        return (
            <OverlayTrigger
                key="species"
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-species`}>
                        {help}
                    </Tooltip>
                }
            >
                <Form.Group controlId="species" style={{ marginTop: "1em" }}>
                    <FloatingLabel label="Species Part">
                        <Form.Control disabled={disabled} type="text" placeholder="The species part of a name below species rank." name="speciesString" value={speciesString} onChange={handleSpeciesChange} />
                    </FloatingLabel>
                </Form.Group>
            </OverlayTrigger>
        );


    }

    function renderName() {

        let disabled = false;
        let help = "The main name part.";

        // if we are a genus or species and we have children we can't be changed or we break the children
        if (
            (name.rank.name === "genus" || name.rank.name === "species")
            && name.taxonPlacement
            && name.taxonPlacement.children
            && name.taxonPlacement.children.length > 0
        ) {

            disabled = true;
            help = "This is the accepted name of a " + name.rank.name + " which contains other taxa so its name can't be changed."
        }

        /*

        return (
            <Form.Group controlId="name">
                <Form.Label title={name.id}>Name</Form.Label>
                <Form.Control disabled={disabled} type="text" placeholder="The main name component" name="nameString" value={nameString} onChange={handleNameChange} />
                <Form.Text className="text-muted"></Form.Text>
            </Form.Group>
        )

        */


        return (
            <OverlayTrigger
                key="name"
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-name`}>
                        {help}
                    </Tooltip>
                }
            >
                <Form.Group controlId="name" style={{ marginTop: "1em" }}>
                    <FloatingLabel label="Main Name" >
                        <Form.Control disabled={disabled} type="text" placeholder="The main name component" name="nameString" value={nameString} onChange={handleNameChange} />
                    </FloatingLabel>
                </Form.Group>
            </OverlayTrigger>
        )

    }

    function renderButton() {

        // should we be disabled
        let disabled = true;
        let text = 'Update';
        let spinner = null;

        if (
            rankString !== name.rank.name
            ||
            nameString !== name.nameString
            ||
            speciesString !== name.speciesString
            ||
            genusString !== name.genusString
        ) {
            disabled = false;
        } else {
            // nothing has changed so don't render
            return null;
        }

        if (loading) {
            text = "Updating";
            disabled = true;
            spinner = <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />
        } else {
            text = "Update";
        }

        return (
            <Form.Group controlId="submit-button" style={{ textAlign: "right", marginTop: "1em" }}>
                <Button disabled={disabled} variant="primary" type="submit" onClick={handleSubmit}>
                    {text}
                    {" "}
                    {spinner}
                </Button>
            </Form.Group>

        );

    }

    return (
        <Form onSubmit={handleSubmit}>
            <Card bg="secondary" text="white" style={{ marginBottom: "1em" }}>
                <Card.Header>Name Parts</Card.Header>
                <Card.Body style={{ backgroundColor: "white", color: "gray" }}>
                    {renderRank()}
                    {renderGenus()}
                    {renderSpecies()}
                    {renderName()}
                    <AlertUpdate response={mData ? mData.updateNameParts : null} loading={mLoading} wfo={props.wfo} />
                    {renderButton()}
                </Card.Body>
            </Card>
        </Form>
    );


}
export default CardNameParts;