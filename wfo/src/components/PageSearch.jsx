import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

import {
    useQuery,
    gql
} from "@apollo/client";

const NAME_SEARCH = gql`
  query doNameSearch($queryString: String!){
getNamesByStringMatch(queryString: $queryString){
  distances,
  nameParts,
  authors,
  rank,
  names{
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
}
}
`;

function PageSearch(props) {

    const { loading, error, data, refetch } = useQuery(NAME_SEARCH, {
        variables: { queryString: "" }
    });

    const [queryString, setQueryString] = useState("");

    function handleChange(event) {
        setQueryString(event.target.value);

        if (queryString.length > 4 && !loading) {
            refetch({ queryString: queryString });
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        refetch({ queryString: "Geum" });
        /*
              
              doSearch(queryString);
          */
    }

    function getParsedName() {

        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error :(</p>;

        const nameParts = data.getNamesByStringMatch.nameParts;

        if (nameParts === null) {
            return <span>Nothing submitted.</span>;
        };

        if (nameParts.length == 0) {
            return <span>No name parts</span>;
        }

        return (
            nameParts.map(part => {
                return <span>{part} </span>
            })
        );

    }

    function getParsedRank() {

        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error :(</p>;

        const rank = data.getNamesByStringMatch.rank;

        if (rank === null) {
            return <span>Nothing found.</span>;
        };

        return (<span>{rank} </span>);

    }

    function getResultRows() {

        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error :(</p>;

        const names = data.getNamesByStringMatch.names;

        // do nothing if we have now content
        if (names === null) {
            return <p>No names</p>;
        };

        return (
            names.map((name, index) => {
                return getNameRendered(name, index);
            })

        );

    }

    function getNameLink(nameString, wfo) {
        return < a href={"#" + wfo} onClick={(e) => { e.preventDefault(); window.location.hash = wfo; }} dangerouslySetInnerHTML={{ __html: nameString }} />
    }

    function getNameRendered(name, index) {

        const distances = data.getNamesByStringMatch.distances;

        // what is the state of this name?
        let placement = null;
        let border = "secondary";

        if (name.taxonPlacement) {

            let familyLink = "";
            if (name.taxonPlacement.family) {
                familyLink = getNameLink(name.taxonPlacement.family.acceptedName.fullNameString, name.taxonPlacement.family.acceptedName.wfo);
            }

            let orderLink = "";
            if (name.taxonPlacement.order) {
                orderLink = getNameLink(name.taxonPlacement.order.acceptedName.fullNameString, name.taxonPlacement.order.acceptedName.wfo);
            }

            let order = name.taxonPlacement.order;

            if (name.taxonPlacement.acceptedName.wfo == name.wfo) {
                placement = <span>Accepted taxon name.
                    {" "} [{familyLink}{", "}{orderLink}]
                </span>;
                border = "success";
            } else {
                let accepted = name.taxonPlacement.acceptedName;
                placement = <span>
                    A synonym of {' '}
                    {getNameLink(accepted.fullNameString, accepted.wfo)}
                    {" "} [{familyLink}{", "}{orderLink}]
                </span>
            }
        } else {
            if (name.status == 'deprecated') {
                border = "danger";
                placement = <span>Deprecated name. Do not use.</span>;
            } else {
                border = "primary";
                if (name.status) {
                    placement = <span>This name has not been placed in taxonomy. Nomenclatural status: {name.status}</span>;
                } else {
                    placement = <span>This name has not been placed in taxonomy. The nomenclatural status has not been set.</span>;
                }
                placement = <span>This name has not been placed in taxonomy.</span>;
            }
        }


        return (<Row>
            <Col>
                <Card border={border} style={{ marginBottom: '0.5em' }}>
                    <Card.Body>
                        <Card.Text>
                            <p>
                                <Badge pill variant="secondary">{distances[index]}</Badge>{" "}
                                {getNameLink(name.fullNameString, name.wfo)}
                                {" "}
                                {placement}
                            </p>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
        );
    }

    // finally render
    if (props.hash != 'search') return null;

    return (
        <Container style={{ marginTop: "2em" }}>
            <Row>
                <Col>
                    <Form onSubmit={handleSubmit}>
                        <Row className="align-items-center">
                            <Col>
                                <Form.Control type="text" placeholder="Enter a name of interest" value={queryString} onChange={handleChange} />
                            </Col>
                            <Col xs="auto">
                                <Button type="submit">Search</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <div><strong>Name parts: </strong>{getParsedName()} <strong>Rank: </strong> {getParsedRank()}</div>
            <hr />
            {getResultRows()}
        </Container>
    );




}
export default PageSearch