import React, { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import CardSearchResults from "./CardSearchResults";

import {
    useLazyQuery,
    gql
} from "@apollo/client";


function PageSearchAlpha(props) {

    const NAME_SEARCH = gql`
  ${props.nameFieldsFragment}
  query doNameAlphaSearch($queryString: String!){
    getNamesByAlphaMatch(queryString: $queryString){
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
        runSearch({ variables: { queryString: event.target.value } });
    }

    function handleSubmit(event) {
        event.preventDefault();
        runSearch({ variables: { queryString: queryString } });
    }

    return (
        <>
            <Form onSubmit={handleSubmit} style={{ marginBottom: "1em" }}>
                <Row className="align-items-center">
                    <Col>
                        <Form.Control type="text" placeholder="Enter a name of interest" value={queryString} onChange={handleChange} />
                    </Col>
                    <Col xs="auto">
                        <Button type="submit">Search</Button>
                    </Col>
                </Row>
            </Form>
            <CardSearchResults names={data ? data.getNamesByAlphaMatch.names : null} distances={data ? data.getNamesByAlphaMatch.distances : null} loading={loading} error={error} />
        </>

    );

}
export default PageSearchAlpha