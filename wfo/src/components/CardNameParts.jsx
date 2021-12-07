import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import AlertUpdate from "./AlertUpdate";
import { useMutation, useQuery, gql, cache } from "@apollo/client";

const NAME_PARTS_QUERY = gql`
  query getNameParts($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            nameString,
            genusString,
            speciesString,
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

    const { loading, error, data } = useQuery(NAME_PARTS_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updateNameParts, { mData, mLoading, mError }] = useMutation(UPDATE_NAME_PARTS, {
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
    if (wfo != props.wfo) {
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
            if (rank.name == "species") break;

            // found a the rank
            if (rank.name == newRank) {
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
            if (rank.name == "species") break;

            // found a the rank
            if (rank.name == rankString) {
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

        console.log("wfo: " + wfo);
        console.log("rank: " + rankString);
        console.log("name: " + nameString);
        console.log("genus: " + genusString);
        console.log("species: " + speciesString);

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

        if (name && name.taxonPlacement && name.taxonPlacement.acceptedName.id == name.id) {

            help = "This is the name of an accepted " + name.rank.name + " and therefore the possible ranks are restricted to those permissible within the parent taxon.";

            // if we are a genus or species with children our rank can't be changed because it
            // would change the names of our children
            if (
                (name.rank.name === "genus" || name.rank.name === "species")
                && name.taxonPlacement.children
                && name.taxonPlacement.children.length > 0
            ) {
                disabled = true;
                help = "The is the name of an accepted " + name.rank.name + " with children whose names depend on it so the rank can't be changed.";

            }

        }

        return (
            <Form.Group controlId="rank">
                <Form.Label>Rank</Form.Label>
                <Form.Select name="rankString" disabled={disabled} value={rankString} onChange={handleRankChange}>
                    {getRanks()}
                </Form.Select>
                <Form.Text className="text-muted">
                    {help}
                </Form.Text>
            </Form.Group>
        );

    }

    function getRanks() {

        // safety catch for rendering empty
        if (!name || !ranks) return null;

        /*
            So what ranks can be set here?
            if we are unplaced or a synonym then anything!
            if we are an accepted name then only what is permitted below our parents
        */

        const options = [];

        for (const idx in ranks) {

            let rank = ranks[idx];
            let disabled = false;

            // if we are an accepted name we disable some ranks
            if (name.taxonPlacement && name.taxonPlacement.acceptedName.id == name.id && name.taxonPlacement.parent.acceptedName) {
                disabled = true;
                name.taxonPlacement.parent.acceptedName.rank.children.map(kidRank => {
                    if (kidRank.name == rank.name) disabled = false;
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
        if (name.rank.name === "genus") return null;

        // work through the other ranks
        for (var i = 0; i < ranks.length; i++) {
            let rank = ranks[i];
            if (rank.name === name.rank.name) return null; // we found our rank
            if (rank.name === "genus") break; // we got to genus so we are good to go
        }

        // if we are part of the taxonomy then we can't be changes.
        let disabled = false;
        let help = "Ranks below genus level have a genus part to the name.";
        if (name.taxonPlacement && name.taxonPlacement.acceptedName.id == name.id && name.taxonPlacement.parent.acceptedName) {
            disabled = true;
            help = "This is the accepted name of a taxon and the genus part therefore has to agree with the genus it is placed in."
        }

        return (
            <Form.Group controlId="genus">
                <Form.Label>Genus Part</Form.Label>
                <Form.Control disabled={disabled} type="text" placeholder="Genus part of name below genus rank." name="genusString" value={genusString} onChange={handleGenusChange} />
                <Form.Text className="text-muted">{help}</Form.Text>
            </Form.Group>
        );
    }

    function renderSpecies() {

        // we are a species so we don't have a genus part.
        if (name.rank.name === "species") return null;

        // work through the other ranks
        for (var i = 0; i < ranks.length; i++) {
            let rank = ranks[i];
            if (rank.name === name.rank.name) return null; // we found our rank
            if (rank.name === "species") break; // we got to species so we are good to go
        }

        return (
            <Form.Group controlId="species">
                <Form.Label>Species Part</Form.Label>
                <Form.Control type="text" placeholder="The species part of a name below species rank." name="speciesString" value={speciesString} onChange={handleSpeciesChange} />
                <Form.Text className="text-muted">Species must have a genus name.</Form.Text>
            </Form.Group>
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

        return (
            <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control disabled={disabled} type="text" placeholder="The main name component" name="nameString" value={nameString} onChange={handleNameChange} />
                <Form.Text className="text-muted">{help}</Form.Text>
            </Form.Group>
        )
    }

    function renderButton() {

        // should we be disabled
        let disabled = true;
        let text = 'Save';
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
            disabled = true;
        }

        if (loading) {
            text = "Saving";
            disabled = true;
            spinner = <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />
        } else {
            text = "Save";
        }

        return (
            <Form.Group controlId="submit-button" style={{ textAlign: "right" }}>
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
            <Card style={{ marginBottom: "1em" }}>
                <Card.Header>Name Parts</Card.Header>
                <Card.Body>
                    {renderRank()}
                    {renderGenus()}
                    {renderSpecies()}
                    {renderName()}
                    <AlertUpdate response={mData} />
                    {renderButton()}
                </Card.Body>
            </Card>
        </Form>
    );


}
export default CardNameParts;