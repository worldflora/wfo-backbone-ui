import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {
    gql
} from "@apollo/client";

class PageForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            taxon: null,
            acceptedName: null
        };

    }


    getTaxonName = () => {
        this.props.graphClient.query({
            query: gql`
      query GetRates {
        rates(currency: "USD") {
          currency
        }
      }
    `
        }).then(result => console.log(result));

        return this.props.wfo;
    }

    render() {

        return (
            <Container style={{ marginTop: "2em" }}>
                <Row>
                    <Col>
                        <h2>Form Page</h2>
                        <p>{this.getTaxonName()}</p>
                    </Col>
                </Row>
            </Container>
        );


    }


}
export default PageForm