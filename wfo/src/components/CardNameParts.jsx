import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { gql } from "@apollo/client";

class CardNameParts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rankString: this.props.name.rank.name,
            nameString: this.props.name.nameString,
            speciesString: this.props.name.speciesString,
            genusString: this.props.name.genusString,
            wfo: this.props.key
        };

    }

    handleChange = (event) => {

        let val = event.target.value;
        let field = event.target.name;
        const s = {};

        // we only deal with single words which may (in extremis have hyphens)
        val = val.replace(/[^A-Za-z-]/g, '');

        // Everything is lowercase
        val = val.toLowerCase();

        // apart from the genus which is upper
        if (field == "genusString") {
            val = val.charAt(0).toUpperCase() + val.slice(1);
        }

        // and the name if we are above species level
        if (field === "nameString") {

            for (var i = 0; i < this.props.ranks.length; i++) {

                let rank = this.props.ranks[i];

                // stop at species
                if (rank.name == "species") break;

                // found a the rank
                if (rank.name == this.state.rankString) {
                    val = val.charAt(0).toUpperCase() + val.slice(1);
                }

            }
        }

        // if we have changed the rank then it may result in an update
        // of the nameString capitalization - yes this repeats the code block above a bit
        // but is the simplest way of doing it.
        if (field === "rankString") {

            let ns = this.state.nameString;
            ns = ns.toLowerCase();

            // uppercase it if we are above species level
            for (var i = 0; i < this.props.ranks.length; i++) {

                let rank = this.props.ranks[i];

                // stop at species
                if (rank.name == "species") break;

                // found a the rank
                if (rank.name == val) {
                    ns = ns.charAt(0).toUpperCase() + ns.slice(1);
                    break;
                }
            }

            // set it in the new state
            s['nameString'] = ns;

        }

        // set the value in the new version of the state
        s[field] = val;

        this.setState(s);

    }

    getButtonDisabled = () => {

        if (
            this.state.rankString !== this.props.name.rank.name
            ||
            this.state.nameString !== this.props.name.nameString
            ||
            this.state.speciesString !== this.props.name.speciesString
            ||
            this.state.genusString !== this.props.name.genusString
        ) {
            return false;
        } else {
            return true;
        }

    }

    handleSubmit = (event) => {
        event.preventDefault();
        /*
                // we are going to issue a mutation 
                // if successful we will update the local version of the data so it should be in line with the 
                // version in the db
        
                this.props.graphClient.query({
                    mutation: gql`
        mutation {
          updateNameParts(
              wfo: "forgiven",
              nameString: "banana",
              genusString: "banana",
              speciesString: "banana",
              rankString: "species"
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
            `
                }).then(result => {
        
        
                    console.log(result);
                    // do stuff with the result
                    // was it successful?
        
                });
        
                console.log(event);
            */
    }


    renderRank = () => {



        let help = "The rank selected dictates the meaning of the parts of the name.";
        let disabled = false;

        if (this.props.name.taxonPlacement && this.props.name.taxonPlacement.acceptedName.id == this.props.name.id) {

            help = "This is the name of an accepted " + this.props.name.rank.name + " and therefore the possible ranks are restricted to those permissible within the parent taxon.";

            // if we are a genus or species with children our rank can't be changed because it
            // would change the names of our children
            if (
                (this.props.name.rank.name === "genus" || this.props.name.rank.name === "species")
                && this.props.name.taxonPlacement.children
                && this.props.name.taxonPlacement.children.length > 0
            ) {
                disabled = true;
                help = "The is the name of an accepted " + this.props.name.rank.name + " with children whose names depend on it so the rank can't be changed.";

            }

        }



        return (
            <Form.Group controlId="rank">
                <Form.Label>Rank</Form.Label>
                <Form.Select name="rankString" disabled={disabled} value={this.state.rankString} onChange={this.handleChange}>
                    {this.getRanks()}
                </Form.Select>
                <Form.Text className="text-muted">
                    {help}
                </Form.Text>
            </Form.Group>
        );

    }

    getRanks = () => {

        // safety catch for rendering empty
        if (!this.props.name || !this.props.ranks) return null;

        /*
            So what ranks can be set here?
            if we are unplaced or a synonym then anything!
            if we are an accepted name then only what is permitted below our parents
        */

        const options = [];

        for (const idx in this.props.ranks) {

            let rank = this.props.ranks[idx];
            let disabled = false;

            // if we are an accepted name we disable some ranks
            if (this.props.name.taxonPlacement && this.props.name.taxonPlacement.acceptedName.id == this.props.name.id && this.props.name.taxonPlacement.parent.acceptedName) {
                disabled = true;
                this.props.name.taxonPlacement.parent.acceptedName.rank.children.map(kidRank => {
                    if (kidRank.name == rank.name) disabled = false;
                });
            }

            options.push(
                <option disabled={disabled} value={rank.name} key={rank.name} >{rank.name}</option>
            );
        }

        return options;
    }

    renderGenus = () => {

        // we are a genus so we don't have a genus part.
        if (this.state.rankString === "genus") return null;

        // work through the other ranks
        for (var i = 0; i < this.props.ranks.length; i++) {
            let rank = this.props.ranks[i];
            if (rank.name === this.state.rankString) return null; // we found our rank
            if (rank.name === "genus") break; // we got to genus so we are good to go
        }

        // if we are part of the taxonomy then we can't be changes.
        let disabled = false;
        let help = "Ranks below genus level have a genus part to the name.";
        if (this.props.name.taxonPlacement && this.props.name.taxonPlacement.acceptedName.id == this.props.name.id && this.props.name.taxonPlacement.parent.acceptedName) {
            disabled = true;
            help = "This is the accepted name of a taxon and the genus part therefore has to agree with the genus it is placed in."
        }

        return (
            <Form.Group controlId="genus">
                <Form.Label>Genus Part</Form.Label>
                <Form.Control disabled={disabled} type="text" placeholder="Genus part of name below genus rank." name="genusString" value={this.state.genusString} onChange={this.handleChange} />
                <Form.Text className="text-muted">{help}</Form.Text>
            </Form.Group>
        );
    }

    renderSpecies = () => {

        // we are a species so we don't have a genus part.
        if (this.state.rankString === "species") return null;

        // work through the other ranks
        for (var i = 0; i < this.props.ranks.length; i++) {
            let rank = this.props.ranks[i];
            if (rank.name === this.state.rankString) return null; // we found our rank
            if (rank.name === "species") break; // we got to species so we are good to go
        }

        return (
            <Form.Group controlId="species">
                <Form.Label>Species Part</Form.Label>
                <Form.Control type="text" placeholder="The species part of a name below species rank." name="speciesString" value={this.state.speciesString} onChange={this.handleChange} />
                <Form.Text className="text-muted">Species must have a genus name.</Form.Text>
            </Form.Group>
        );


    }

    renderName = () => {

        let disabled = false;
        let help = "The main name part.";

        // if we are a genus or species and we have children we can't be changed or we break the children
        if (
            (this.props.name.rank.name === "genus" || this.props.name.rank.name === "species")
            && this.props.name.taxonPlacement
            && this.props.name.taxonPlacement.children
            && this.props.name.taxonPlacement.children.length > 0
        ) {

            disabled = true;
            help = "This is the accepted name of a " + this.props.name.rank.name + " which contains other taxa so its name can't be changed."
        }

        return (
            <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control disabled={disabled} type="text" placeholder="The main name component" name="nameString" value={this.state.nameString} onChange={this.handleChange} />
                <Form.Text className="text-muted">{help}</Form.Text>
            </Form.Group>
        )
    }

    render() {

        return (
            <Form onSubmit={this.handleSubmit}>
                <Card style={{ marginBottom: "1em" }}>
                    <Card.Header>Name Parts</Card.Header>
                    <Card.Body>


                        {this.renderRank()}
                        {this.renderGenus()}
                        {this.renderSpecies()}
                        {this.renderName()}

                        <Form.Group controlId="submit-button" style={{ textAlign: "right" }}>
                            <Button disabled={this.getButtonDisabled()} variant="primary" type="submit" onClick={this.handleSave}>
                                Save
                            </Button>
                        </Form.Group>


                    </Card.Body>
                </Card>
            </Form>
        );
    }
}
export default CardNameParts;