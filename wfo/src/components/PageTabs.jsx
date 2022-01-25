import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import PageSearchMatching from "./PageSearchMatching";
import PageSearchAlpha from "./PageSearchAlpha";
import PageHome from "./PageHome";
import PageForm from "./PageForm";
import PageAdd from "./PageAdd";
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
    const [activeWfoId, setActiveWfoId] = useState('wfo-9499999999');
    const [user, setUser] = useState();

    const { data, refetch, startPolling, stopPolling } = useQuery(USER_QUERY);

    if (data && data.getUser) {
        if (!user || data.getUser.id !== user.id) {
            setUser(data.getUser);
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
                setActiveWfoId(newHash);
                setActiveTabKey("browse");
            }

        };

        window.addEventListener('hashchange', handleHashChange);

        // cleanup this component
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // nearly all content needs to have a handle on the current user.
    // so we fetch it here.




    return (
        <Container style={{ marginTop: "1em" }}>

            <LoginLogout user={user} refeshUser={refetch} startPolling={startPolling} stopPolling={stopPolling} />

            <Tabs
                activeKey={activeTabKey}
                onSelect={(k, e) => {
                    setActiveTabKey(k);
                }}
                id="search-tabs"
                className="mb-3"
            >
                <Tab eventKey="home" title="Home" >
                    <PageHome user={user} />
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

                <Tab eventKey="add" title="Add Name" >
                    <PageAdd />
                </Tab>

            </Tabs>
        </Container>

    );

}
export default PageTabs