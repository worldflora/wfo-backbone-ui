import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import CardChildren from "./CardChildren";
import CardSynonyms from "./CardSynonyms";
import CardAncestors from "./CardAncestors";
import CardFormHeader from "./CardFormHeader";
import CardNameParts from "./CardNameParts";
import { useQuery, gql } from "@apollo/client";

/*
    Design pattern of using keys to refresh component
    https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-controlled-component

*/

const FORM_DATA = gql`
  query getFormData($wfo: String!){
getNameForWfoId(id: $wfo){
    id,
    wfo,
    fullNameString,
    nameString,
    genusString,
    speciesString,
    authorsString,
    rank{
        name,
        children{
            name
        }
    },
    status,
    isAutonym,
    year,
    citationId,
    citationMicro,
    basionym{
      id
      nameString
      fullNameString,
      genusString,
    	speciesString,
      authorsString,
      status,
      isAutonym
    },
    taxonPlacement{
      id,
      rank{
          name,
          plural
      },
      acceptedName{
        id,
        wfo,
        fullNameString,
        nameString
      },
      parent{
        id
        acceptedName{
          id,
          wfo,
          fullNameString(abbreviateGenus: true),
          rank{
              name,
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


function PageForm(props) {

    const { loading, error, data, refetch } = useQuery(FORM_DATA, {
        variables: { wfo: props.wfo }
    });

    let wfo = null;
    let name = null;
    let ranks = null;
    let taxon = null;
    let synOf = null;

    if (data) {
        name = data.getNameForWfoId;
        wfo = data.getNameForWfoId.wfo;
        ranks = data.getAllRanks
    }

    if (name && name.taxonPlacement) {
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

    // finally render

    // only render if we are the page to be displayed
    if (props.hash != 'form') return null;

    // only render if we have a wfo to display

    console.log(data);


    //if (!name) return null;
    return (

        <Container fluid>
            <Row>
                <Col>
                    <CardAncestors wfo={props.wfo} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <CardFormHeader wfo={props.wfo} />
                    <CardNameParts wfo={props.wfo} />
                    <Card>
                        <Card.Body>
                            <Card.Text>
                                <p><a href="#wfo-9499999999">#wfo-9499999999</a></p>
                                <p><a href="#wfo-9499999998">#wfo-9499999998</a></p>
                                <p><a href="#wfo-0000003319">#wfo-0000003319</a> - with synonyms</p>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={4}>
                    <CardChildren wfo={props.wfo} />
                    <CardSynonyms wfo={props.wfo} />
                </Col>
            </Row>
        </Container>

    );



}
export default PageForm