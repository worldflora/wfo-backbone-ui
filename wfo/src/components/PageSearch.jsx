import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import PageSearchMatching from "./PageSearchMatching";
import PageSearchAlpha from "./PageSearchAlpha";

import {
    useQuery,
    gql
} from "@apollo/client";


function PageSearch(props) {

    const nameFieldsFragment = gql`
  fragment nameFields on NameGql {
        id,
        wfo,
        status,
        fullNameString,
        taxonPlacement{
        id,
        acceptedName{
            wfo
            fullNameString
        }
        family: ancestorAtRank(rank: "family"){
            acceptedName{
            wfo,
            fullNameString(authors: false)
            }
        }
        order: ancestorAtRank(rank: "order"){
            acceptedName{
            wfo,
            fullNameString(authors: false)
            }
        }
    }
  }
`;
    // finally render
    if (props.hash != 'search') return null;

    return (
        <Container style={{ marginTop: "2em" }}>
            <Tabs defaultActiveKey="alpha" id="search-tabs" className="mb-3">

                <Tab eventKey="alpha" title="Simple Alphabetic">
                    <PageSearchAlpha nameFieldsFragment={nameFieldsFragment} />
                </Tab>

                <Tab eventKey="match" title="Name Matching">
                    <PageSearchMatching nameFieldsFragment={nameFieldsFragment} />
                </Tab>

                <Tab eventKey="fields" title="Advanced" >
                    <p>Coming Soon!</p>
                </Tab>
            </Tabs>

        </Container>
    );

}
export default PageSearch