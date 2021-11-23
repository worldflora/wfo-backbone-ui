import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import CardChildren from "./CardChildren";
import CardAncestors from "./CardAncestors";
import CardFormHeader from "./CardFormHeader";

import {
    gql
} from "@apollo/client";

class PageForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            wfo: null,
            name: null,
            taxon: null,
            synOf: null

        };

    }

    componentDidMount() {
        this.loadData();
    }
    componentDidUpdate(prevProps) {
        this.loadData();
    }

    loadData = () => {

        if (this.props.wfo === this.state.wfo) {
            console.log("No need to update: " + this.props.wfo);
            return;
        } else {
            this.setState({
                wfo: this.props.wfo,
                name: null,
                taxon: null,
                synOf: null
            });

            // FIXME: We should test here if the WFO ID really is a WFO ID or if it is an integer
            // if it is an integer then we are loading an unspecified taxon and 
            // we should call an alternative load method based on getTaxonById.
        }

        this.props.graphClient.query({
            query: gql`
query{
	getNameForWfoId(id: "${this.props.wfo}"){
    id,
    wfo,
    nameString,
    genusString,
    speciesString,
    authorsString,
    status,
    isAutonym,
    year,
    citationId,
    citationMicro,
    basionym{
      id
      nameString
      genusString,
    	speciesString,
      authorsString,
      status,
      isAutonym
    },
    taxonPlacement{
      id,
      acceptedName{
        id,
        wfo,
        nameString
      },
      ancestors{
        id,
        acceptedName{
            wfo,
            nameString
        }
      },
      parent{
        id
        acceptedName{
          wfo,
          id
        }
      }
      children{
        id,
        acceptedName{
          wfo,
          nameString
        }
      }
    }
  }
}
    `
        }).then(result => {

            let name = result.data.getNameForWfoId; // we always have a name - loading unspecified taxa is handle separately
            let taxon = null; // do we have a taxon?
            let synOf = null; // or a synonym

            if (name.taxonPlacement) {
                // the name has a placement in the taxonomy.

                if (name.taxonPlacement.acceptedName.id === name.id) {
                    // the name is the accepted name of the taxon it is placed in
                    // we are displaying a taxon!
                    taxon = name.taxonPlacement;
                    synOf = null;

                } else {
                    // the name is not the accepted name of the taxon it is placed in
                    // we are displaying a synonym!
                    taxon = null;
                    synOf = name.taxonPlacement;
                }

            }

            // finally set that lot in the state
            this.setState({
                name: name,
                taxon: taxon,
                synOf: synOf
            });
        });
    }

    /*
     * 
     * What next?
     * This should load a name object and a taxon object if there is on
     * if there is a taxon object it can kick off subloads for children and synonyms
     *  
     * 
     * 
     */

    getTaxonName = () => {


        return "banana";
    }

    getAncestorsCard = () => {
        if (this.state.taxon) {
            return <CardAncestors ancestors={this.state.taxon.ancestors} />
        }
        return "";
    }

    getChildrenCard = () => {
        if (this.state.taxon) {
            return <CardChildren children={this.state.taxon.children} />
        }
        return "";
    }

    render() {

        return (

            <Container fluid>
                <Row>
                    <Col>
                        {this.getAncestorsCard()}
                        <CardFormHeader taxon={this.state.taxon} name={this.state.name} synOf={this.state.synOf} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card>
                            <Card.Body>
                                <Card.Text>
                                    <h2>Form Page</h2>
                                    <p>{this.getTaxonName()}</p>
                                    <p>{process.env.REACT_APP_GRAPHQL_ENDPOINT}</p>
                                    <p><a href="#wfo-9499999999">#wfo-9499999999</a></p>
                                    <p><a href="#wfo-9499999998">#wfo-9499999998</a></p>
                                    <p><a href="#wfo-9499999997">#wfo-9499999997</a></p>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={4}>
                        {this.getChildrenCard()}
                        <p>Synonyms Card</p>
                    </Col>
                </Row>
            </Container>

        );


    }


}
export default PageForm