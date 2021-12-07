import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import AlertUpdate from "./AlertUpdate";

import { useMutation, gql } from "@apollo/client";

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

    const [updateNameParts, { data, loading, error }] = useMutation(UPDATE_NAME_PARTS, () => { console.log('hellow thenere') });


    const [rankString, setRankString] = useState(props.name ? props.name.rank.name : null);
    const [nameString, setNameString] = useState(props.name ? props.name.nameString : null);
    const [speciesString, setSpeciesString] = useState(props.name ? props.name.speciesString : null);
    const [genusString, setGenusString] = useState(props.name ? props.name.genusString : null);
    const [wfo, setWfo] = useState(props.name ? props.name.wfo : null);

    // do nothing if we have no name of ranks
    if (!props.name || !props.ranks) return (<Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
    </Spinner>);

    function handleChange(event) {

        // this written before hooks so structure may seem off

        let val = event.target.value;
        let field = event.target.name;

        // we only deal with single words which may (in extremis have hyphens)
        val = val.replace(/[^A-Za-z-]/g, '');

        // Everything is lowercase
        val = val.toLowerCase();

        // apart from the genus which is upper
        if (field == "genusString") {
            val = val.charAt(0).toUpperCase() + val.slice(1);
            setGenusString(val);
        }

        // and the name if we are above species level
        if (field === "nameString") {

            for (var i = 0; i < props.ranks.length; i++) {

                let rank = props.ranks[i];

                // stop at species
                if (rank.name == "species") break;

                // found a the rank
                if (rank.name == rankString) {
                    val = val.charAt(0).toUpperCase() + val.slice(1);
                }

            }
            console.log("namestring set to " + val);
            setNameString(val);
        }

        // if we have changed the rank then it may result in an update
        // of the nameString capitalization - yes this repeats the code block above a bit
        // but is the simplest way of doing it.
        if (field === "rankString") {

            setRankString(val);

            let ns = nameString;
            ns = ns.toLowerCase();

            // uppercase it if we are above species level
            for (var i = 0; i < props.ranks.length; i++) {

                let rank = props.ranks[i];

                // stop at species
                if (rank.name == "species") break;

                // found a the rank
                if (rank.name == val) {
                    ns = ns.charAt(0).toUpperCase() + ns.slice(1);
                    break;
                }
            }

            // set it in the new state
            setNameString(ns);

        }

        if (field === "speciesString") {
            // only field it could be is speciesString
            setSpeciesString(val);
        }


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

        if (props.name && props.name.taxonPlacement && props.name.taxonPlacement.acceptedName.id == props.name.id) {

            help = "This is the name of an accepted " + props.name.rank.name + " and therefore the possible ranks are restricted to those permissible within the parent taxon.";

            // if we are a genus or species with children our rank can't be changed because it
            // would change the names of our children
            if (
                (props.name.rank.name === "genus" || props.name.rank.name === "species")
                && props.name.taxonPlacement.children
                && props.name.taxonPlacement.children.length > 0
            ) {
                disabled = true;
                help = "The is the name of an accepted " + props.name.rank.name + " with children whose names depend on it so the rank can't be changed.";

            }

        }

        return (
            <Form.Group controlId="rank">
                <Form.Label>Rank</Form.Label>
                <Form.Select name="rankString" disabled={disabled} value={rankString} onChange={handleChange}>
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
        if (!props.name || !props.ranks) return null;

        /*
            So what ranks can be set here?
            if we are unplaced or a synonym then anything!
            if we are an accepted name then only what is permitted below our parents
        */

        const options = [];

        for (const idx in props.ranks) {

            let rank = props.ranks[idx];
            let disabled = false;

            // if we are an accepted name we disable some ranks
            if (props.name.taxonPlacement && props.name.taxonPlacement.acceptedName.id == props.name.id && props.name.taxonPlacement.parent.acceptedName) {
                disabled = true;
                props.name.taxonPlacement.parent.acceptedName.rank.children.map(kidRank => {
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
        if (rankString === "genus") return null;

        // work through the other ranks
        for (var i = 0; i < props.ranks.length; i++) {
            let rank = props.ranks[i];
            if (rank.name === rankString) return null; // we found our rank
            if (rank.name === "genus") break; // we got to genus so we are good to go
        }

        // if we are part of the taxonomy then we can't be changes.
        let disabled = false;
        let help = "Ranks below genus level have a genus part to the name.";
        if (props.name.taxonPlacement && props.name.taxonPlacement.acceptedName.id == props.name.id && props.name.taxonPlacement.parent.acceptedName) {
            disabled = true;
            help = "This is the accepted name of a taxon and the genus part therefore has to agree with the genus it is placed in."
        }

        return (
            <Form.Group controlId="genus">
                <Form.Label>Genus Part</Form.Label>
                <Form.Control disabled={disabled} type="text" placeholder="Genus part of name below genus rank." name="genusString" value={genusString} onChange={handleChange} />
                <Form.Text className="text-muted">{help}</Form.Text>
            </Form.Group>
        );
    }

    function renderSpecies() {

        // we are a species so we don't have a genus part.
        if (rankString === "species") return null;

        // work through the other ranks
        for (var i = 0; i < props.ranks.length; i++) {
            let rank = props.ranks[i];
            if (rank.name === rankString) return null; // we found our rank
            if (rank.name === "species") break; // we got to species so we are good to go
        }

        return (
            <Form.Group controlId="species">
                <Form.Label>Species Part</Form.Label>
                <Form.Control type="text" placeholder="The species part of a name below species rank." name="speciesString" value={speciesString} onChange={handleChange} />
                <Form.Text className="text-muted">Species must have a genus name.</Form.Text>
            </Form.Group>
        );


    }

    function renderName() {

        let disabled = false;
        let help = "The main name part.";

        // if we are a genus or species and we have children we can't be changed or we break the children
        if (
            (props.name.rank.name === "genus" || props.name.rank.name === "species")
            && props.name.taxonPlacement
            && props.name.taxonPlacement.children
            && props.name.taxonPlacement.children.length > 0
        ) {

            disabled = true;
            help = "This is the accepted name of a " + props.name.rank.name + " which contains other taxa so its name can't be changed."
        }

        return (
            <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control disabled={disabled} type="text" placeholder="The main name component" name="nameString" value={nameString} onChange={handleChange} />
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
            rankString !== props.name.rank.name
            ||
            nameString !== props.name.nameString
            ||
            speciesString !== props.name.speciesString
            ||
            genusString !== props.name.genusString
        ) {
            disabled = false;
        } else {
            disabled = true;
        }

        // What should the text be?

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
                    <AlertUpdate response={data} />
                    {renderButton()}
                </Card.Body>
            </Card>
        </Form>
    );


}
export default CardNameParts;