import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import PageSearchMatching from "./PageSearchMatching";
import PageSearchAlpha from "./PageSearchAlpha";
import PageHome from "./PageHome";
import PageForm from "./PageForm";
import PageAdd from "./PageAdd";
import PageStats from "./PageStats";
import PageUsers from "./PageUsers";
import CardDownloads from "./CardDownloads";
import LoginLogout from "./LoginLogout";
import { gql, useQuery } from "@apollo/client";


// used in the search a-z and matching pages
const nameFieldsFragment = gql`

  fragment nameFields on NameGql {
        id
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


// we load the user here and pass it down to 
// components that need authorization
const USER_QUERY = gql`
   query{
        getUser{
            id,
            isAnonymous,
            name,
            orcid,
            orcidLogInUri,
            orcidLogOutUri
        }
    }
`;


function PageTabs(props) {

    const [activeTabKey, setActiveTabKey] = useState('home');
    const [activeWfoId, setActiveWfoId] = useState('wfo-9971000003'); // default to Code WFO
    const [user, setUser] = useState();

    const { data, refetch, startPolling, stopPolling } = useQuery(USER_QUERY);

    if (data && data.getUser) {
        if (!user || data.getUser.id !== user.id) {

            setUser(data.getUser);

            // if we have just logged in then we should check what the
            // hash is. They could have come here with a wfo in the hash 
            // and then logged in or refreshed the page in which case
            // the user
            let currentHash = window.location.hash.substring(1);
            let pattern = /^wfo-[0-9]{10}$/;
            if (pattern.test(currentHash)) {
                if (activeWfoId !== currentHash) setActiveWfoId(currentHash); // update the name we are looking at if it is new.
                if (activeTabKey !== "browse") setActiveTabKey("browse"); // display it in the browse tab
            } else {
                if (!currentHash) currentHash = 'home';
                setActiveTabKey(currentHash);
            }

        }
    }

    // authorisation over ride
    // can only be on home page
    if (!user || user.isAnonymous) {
        if (activeTabKey !== "home") {
            setActiveTabKey("home");
        }
    }


    /*
    * This is how we handle register and deregister of event listeners 
    * Nice description of how/why here; https://www.pluralsight.com/guides/event-listeners-in-react-components
    */
    React.useEffect(() => {

        function handleHashChange(event) {


            let newHash = window.location.hash.substring(1);
            let pattern = /^wfo-[0-9]{10}$/;

            // are we looking at a wfo or a page?
            if (pattern.test(newHash)) {
                if (activeWfoId !== newHash) setActiveWfoId(newHash); // update the name we are looking at if it is new.
                if (activeTabKey !== "browse") setActiveTabKey("browse"); // display it in the browse tab
            } else {
                if (newHash === "browse") {
                    // we never have a browse anchor because it is synonymous with a wfo-id
                    // if they have clicked on browse we just update the hash but don't change
                    // the tab
                    window.location.hash = activeWfoId;
                } else {
                    // we switch to the tab 
                    setActiveTabKey(newHash);
                }

            }


        };

        window.addEventListener('hashchange', handleHashChange);

        // cleanup this component
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [activeWfoId, activeTabKey]);


    return (
        <Container style={{ marginTop: "1em" }}>

            <LoginLogout user={user} refeshUser={refetch} startPolling={startPolling} stopPolling={stopPolling} />

            <Tabs
                activeKey={activeTabKey}
                onSelect={(k, e) => {
                    setActiveTabKey(k);
                    window.location.hash = k;
                }}
                id="search-tabs"
                className="mb-3"
            >
                <Tab eventKey="home" title="Home" >
                    <PageHome user={user} />
                </Tab>

                <Tab eventKey="alpha" title="A-Z" disabled={!user || user.isAnonymous}>
                    <PageSearchAlpha nameFieldsFragment={nameFieldsFragment} />
                </Tab>

                <Tab eventKey="match" title="Matching" disabled={!user || user.isAnonymous}>
                    <PageSearchMatching nameFieldsFragment={nameFieldsFragment} />
                </Tab>

                <Tab eventKey="browse" title="Browse" disabled={!user || user.isAnonymous} >
                    <PageForm wfo={activeWfoId} user={user} />
                </Tab>

                <Tab eventKey="add" title="Add Name" disabled={!user || user.isAnonymous}>
                    <PageAdd />
                </Tab>

                <Tab eventKey="stats" title="Stats" disabled={!user || user.isAnonymous}>
                    <PageStats />
                </Tab>

                <Tab eventKey="users" title="Users" disabled={!user || user.isAnonymous}>
                    <PageUsers />
                </Tab>

                <Tab eventKey="data" title="Data" disabled={!user || user.isAnonymous}>
                    <Container style={{ marginTop: "2em" }}>
                        <h2>Data Downloads</h2>

                        <CardDownloads header="Lookup Files" directoryName="lookup" fileEnding="gz" >
                            A common request is for a list that can be used in a look up table or in a name matching algorithm.
                            This section contains these lists. Unless indicated otherwise they are generated nightly.
                            The download links are stable so you can periodically poll them if you need to.
                        </CardDownloads>

                        <CardDownloads header="HTML Proofing Files" directoryName="html" fileEnding="zip" >
                            Sometimes it is easier to review lists of names as documents rather than as database entry screens or spreadsheets.
                            We therefore produce lists for each family in HTML format that can be loaded into a word processor and in extremis
                            printed out. This is somewhat experimental so it would be good to hear what you have to say. At the moment
                            both homotypic names and synonyms are printed within an accepted name so there is some duplication but this makes
                            it easier to spot errors. Larger families are divided into files of less than 2,000 names (about 100 pages of A4).
                            This is a long list so use ctrl-f to search for the family you are after. They are updated every few days.
                        </CardDownloads>

                        <CardDownloads header="Darwin Core Archives" directoryName="dwc" fileEnding="zip" >
                            Darwin Core Archive is a widely used exchange format. For compatibility we provide
                            a set of DwC Archive files, one for each family recognized in the taxonomy.
                            These are generated on rotation but should never be more than a few days old.
                            This is a long list so use ctrl-f to search for the family you are after.
                        </CardDownloads>

                        <CardDownloads header="Statistics" directoryName="stats" fileEnding="gz" >
                            Statistics summarizing data and activity within the system.
                        </CardDownloads>


                        <p>If the data you are looking for isn't here in the format or with the frequency you need it please <a href="mailto:rhyam@rbge.org.uk">contact us</a> and we will try and get you what you need.</p>

                    </Container>
                </Tab>

            </Tabs>
        </Container>

    );

}
export default PageTabs