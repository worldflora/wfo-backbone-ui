import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import PageSearchMatching from "./PageSearchMatching";
import PageSearchAlpha from "./PageSearchAlpha";
import PageHome from "./PageHome";
import PageForm from "./PageForm";
import { gql } from "@apollo/client";


function PageTabs(props) {

    const [activeTabKey, setActiveTabKey] = useState('home');
    const [activeWfoId, setActiveWfoId] = useState(null);

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



    React.useEffect(() => {

        /*
        * This is how we handle register and deregister of event listeners 
        * Nice description of how/why here; https://www.pluralsight.com/guides/event-listeners-in-react-components
        */
        function handleHashChange(event) {

            //console.log(window.location.hash);

            let newHash = window.location.hash.substring(1);
            let pattern = /^wfo-[0-9]{10}$/;

            // are we looking at a wfo or a page?
            if (pattern.test(newHash)) {

                // it is a wfo id - if it a new one then update it 
                // and display the browser page for it
                if (newHash !== activeTabKey) {
                    setActiveWfoId(newHash);
                    setActiveTabKey("browse");
                }

            } else {

                // it is a page so we keep the wfo the same
                // and just switch the tab displayed - if it is new
                if (newHash !== activeTabKey) {
                    setActiveTabKey(newHash);
                }
            }


        };

        window.addEventListener('hashchange', handleHashChange);

        // cleanup this component
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    console.log(activeTabKey);

    // does the activeTabKey look like a WFO ID - if so we need to change it!


    return (
        <Container style={{ marginTop: "1em" }}>
            <Tabs
                activeKey={activeTabKey}
                onSelect={(k) => {
                    //                    setActiveTabKey(k);
                    window.location.hash = k;
                }}
                id="search-tabs"
                className="mb-3"
            >
                <Tab eventKey="home" title="Home" >
                    <PageHome />
                </Tab>

                <Tab eventKey="alpha" title="A-Z">
                    <PageSearchAlpha nameFieldsFragment={nameFieldsFragment} />
                </Tab>

                <Tab eventKey="match" title="Matching">
                    <PageSearchMatching nameFieldsFragment={nameFieldsFragment} />
                </Tab>

                <Tab eventKey="browse" title="Browse" >
                    <PageForm wfo={activeWfoId} />
                </Tab>
            </Tabs>
        </Container>

    );


}
export default PageTabs