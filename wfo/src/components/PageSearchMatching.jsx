import React, { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import CardSearchResults from "./CardSearchResults";

import { useLazyQuery, gql } from "@apollo/client";


function PageSearchMatching(props) {


    const NAME_SEARCH = gql`
${props.nameFieldsFragment}
  query doNameSearch($queryString: String!){
    getNamesByStringMatch(queryString: $queryString){
  distances,
  nameParts,
  authors,
  rank,
  names{
   ...nameFields
  }
}
}
`;

    const [runSearch, { loading, error, data }] = useLazyQuery(NAME_SEARCH);

    const [queryString, setQueryString] = useState("");

    function handleChange(event) {
        setQueryString(event.target.value);
        if (event.target.value.length > 3) {
            runSearch({ variables: { queryString: event.target.value } });
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        runSearch({ variables: { queryString: queryString } });
        /*
              
              doSearch(queryString);
          */
    }

    function getParsedName() {

        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error :(</p>;
        if (!data) return null;

        const nameParts = data.getNamesByStringMatch.nameParts;

        if (nameParts === null) {
            return <span>Nothing submitted.</span>;
        };

        if (nameParts.length === 0) {
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
        if (!data) return null;

        const rank = data.getNamesByStringMatch.rank;

        if (rank === null) {
            return <span>Nothing found.</span>;
        };

        return (<span>{rank} </span>);

    }

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Row className="align-items-center">
                    <Col>
                        <Form.Control type="text" placeholder="Enter a name of interest include rank" value={queryString} onChange={handleChange} />
                    </Col>
                    <Col xs="auto">
                        <Button type="submit">Search</Button>
                    </Col>
                </Row>
            </Form>
            <div><strong>Name parts: </strong>{getParsedName()} <strong>Rank: </strong> {getParsedRank()}</div>
            <hr />
            <CardSearchResults names={data ? data.getNamesByStringMatch.names : null} distances={data ? data.getNamesByStringMatch.distances : null} loading={loading} error={error} />
        </>

    );




}
export default PageSearchMatching