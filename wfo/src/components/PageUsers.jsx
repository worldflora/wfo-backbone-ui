import React from "react";
import { useQuery, gql } from "@apollo/client";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import LinkOrcid from "./LinkOrcid";

const USERS_QUERY = gql`
  query getPossibleEditors{
        getPossibleEditors{
            id,
            name,
            uri,
            orcid,
            isEditor,
            isGod,
            taxaCurated{
                    id,
                    acceptedName{
                        id,
                        wfo,
                        fullNameString
                }
            }
        }
 }
`;


function PageUsers(props) {


    const { data, loading, refetch } = useQuery(USERS_QUERY);


    function getUserList(listEditors, listGods) {
        if (!data) {
            return null;
        }

        return (
            <ListGroup style={{ maxHeight: "30em", overflow: "auto" }}>
                {
                    data.getPossibleEditors.map(user => {
                        if (listGods !== user.isGod) return null;
                        if (listEditors !== user.isEditor) return null;
                        return <ListGroup.Item key={user.id}>
                            <strong>{user.name}</strong>&nbsp;
                            <LinkOrcid user={user} />
                            {getWebButton(user)}
                            {user.taxaCurated.length ? <><br /><span>Curator of:&nbsp;</span></> : ""}
                            {
                                user.taxaCurated.map((taxon, i) => {

                                    return <span key={taxon.id}><a href={'#' + taxon.acceptedName.wfo} dangerouslySetInnerHTML={{ __html: taxon.acceptedName.fullNameString }} /> {i < user.taxaCurated.length - 1 ? "," : ""}&nbsp;</span>
                                })
                            }

                        </ListGroup.Item>
                    })

                }

            </ListGroup>
        )

    }

    /*

    function getOrcidButton(user) {
        if (!user.orcid) return null;
        return (
            <a href={"https://orcid.org/" + user.orcid} >
                <img target="orcid" alt="ORCID logo" src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" width="16" height="16" />
                https://orcid.org/{user.orcid}
            </a>
        );
    }
*/

    function getWebButton(user) {
        if (!user.uri) return null;

        return (
            <a target="wfo" href={user.uri}>{user.uri}</a>
        );

    }

    return (
        <Container fluid style={{ marginTop: "2em" }}>

            <h2>Rhakhis Users</h2>

            <Card bg="light" text="dark" className="wfo-downloads" style={{ marginBottom: "1em" }}>
                <Card.Header>Administrators</Card.Header>
                <Card.Body>
                    <Card.Text>Administrative users are those who run the system. They can edit anything, including other users, but are not necessarily taxonomic experts.</Card.Text>
                </Card.Body>
                {getUserList(true, true)}

            </Card>


            <Card bg="light" text="dark" className="wfo-downloads" style={{ marginBottom: "1em" }}>
                <Card.Header>Editors</Card.Header>
                <Card.Body>
                    <Card.Text>Editors have been assigned to curate at least one taxon.
                        They can edit that taxon and all taxa below it in the classification.
                        They can also edit any name that hasn't been placed in the taxonomy yet and place those names in taxa they edit.
                        They can assign other users to be curators of taxa that they edit and so build a team to work on a taxonomic group.</Card.Text>
                </Card.Body>
                {getUserList(true, false)}
            </Card>

            <Card bg="light" text="dark" className="wfo-downloads" style={{ marginBottom: "1em" }}>
                <Card.Header>Viewers</Card.Header>
                <Card.Body>
                    <Card.Text>These are people who can log in and see everything but can't edit anything. Editors and administrators can assign viewers to curate a taxon and so elevate them to being editors.</Card.Text>
                </Card.Body>
                {getUserList(false, false)}
            </Card>

            <Button variant="outline-secondary" onClick={() => refetch()}>{loading ? "Loading" : "Refresh List"}</Button>

        </Container>

    );



}
export default PageUsers