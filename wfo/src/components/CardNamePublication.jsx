import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import AlertUpdate from "./AlertUpdate";
import FloatingLabel from "react-bootstrap/FloatingLabel";


const PUBLICATION_QUERY = gql`
   query getPublication($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            citationMicro,
            year
        }
    }
`;

const UPDATE_PUBLICATION = gql`
        mutation  updatePublication(
            $wfo: String!,
            $citationMicro: String!,
            $year: Int!
            ){
          updatePublication(
              wfo: $wfo,
              citationMicro: $citationMicro,
              year: $year
          ){
            name,
            success,
            message,
            children{
              name,
              success,
              message
            }
          }
        }
`;

function CardNamePublication(props) {

    const [citationMicro, setCitationMicro] = useState('');
    const [year, setYear] = useState('');
    const [yearValid, setYearValid] = useState(true);
    const [wfo, setWfo] = useState('');

    const { loading, data } = useQuery(PUBLICATION_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updatePublication, { loading: mLoading, data: mData }] = useMutation(UPDATE_PUBLICATION, {
        refetchQueries: [
            PUBLICATION_QUERY, // run this query again
            'getPublication'
        ],
    });

    let name = data ? data.getNameForWfoId : null;

    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
        setCitationMicro(name.citationMicro === null ? "" : name.citationMicro);
        setYear(name.year === null ? "" : name.year);
    }

    function handleSubmit(event) {

        event.preventDefault();
        updatePublication(
            {
                variables: {
                    wfo: props.wfo,
                    citationMicro: citationMicro,
                    year: parseInt(year)
                }
            }
        );
    }

    function handleCitationMicroChange(event) {
        event.preventDefault();
        setCitationMicro(event.target.value);
    }

    function handleYearChange(event) {
        event.preventDefault();
        setYear(event.target.value);

        // check if the year is valid
        if (!isNaN(event.target.value)) {
            let y = parseInt(event.target.value);
            const d = new Date();
            if (Number.isInteger(y) && y <= d.getFullYear() && y > 1752) {
                setYearValid(true);
                return;
            }
        }

        // empty string is OK
        if (event.target.value.length === 0) {
            setYearValid(true);
            return;
        }

        setYearValid(false);

    }

    function renderButton() {

        // do nothing if nothing has changed
        if (!name) return null;

        // if the year is invalid do nothing
        if (!yearValid) return null;

        if (name) {
            if (name.citationMicro === citationMicro && (name.year === parseInt(year) || (name.year == null && year.length === 0))) return null;
        }

        // should we be disabled
        let spinner = null;

        if (loading) {
            spinner = <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />
        }

        return (
            <Form.Group controlId="submit-button" style={{ textAlign: "right", marginTop: "1em" }}>
                <Button variant="primary" type="submit" onClick={handleSubmit}>
                    Update
                    {" "}
                    {spinner}
                </Button>
            </Form.Group>
        );


    }

    return (
        <Form onSubmit={handleSubmit} noValidate="true">
            <Card bg="secondary" text="white" style={{ marginBottom: "1em" }}>
                <Card.Header>Publication</Card.Header>
                <Card.Body style={{ backgroundColor: "white", color: "gray" }} >
                    <OverlayTrigger
                        key="micro-citation-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-micro-citation`}>
                                The abbreviated (micro) citation for the place of publication of the name.
                            </Tooltip>
                        }
                    >
                        <Form.Group controlId="micro-citation">
                            <FloatingLabel label="Citation, abbreviated">
                                <Form.Control type="text" placeholder="Abbreviated citation of publication" name="citationMicro" value={citationMicro} onChange={handleCitationMicroChange} />
                            </FloatingLabel>
                        </Form.Group>
                    </OverlayTrigger>

                    <OverlayTrigger
                        key="year-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-year`}>
                                The year of valid publication of the name. 1753 to present. No ranges.
                            </Tooltip>
                        }
                    >
                        <Form.Group controlId="year">
                            <FloatingLabel label="Year">
                                <Form.Control type="text" style={{ color: yearValid ? 'black' : 'red', marginTop: "1em" }} placeholder="Year of publication" name="year" value={year} onChange={handleYearChange} />
                            </FloatingLabel>
                        </Form.Group>
                    </OverlayTrigger>

                    <AlertUpdate response={mData ? mData.updatePublication : null} loading={mLoading} wfo={props.wfo} />
                    {renderButton()}
                </Card.Body>
            </Card>
        </Form>

    );

}
export default CardNamePublication;
