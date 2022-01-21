import React, { useState } from "react";
import { useMutation, gql } from '@apollo/client';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import CardNameSimilar from "./CardNameSimilar";

const CREATE_NAME = gql`
        mutation  createName(
              $proposedName: String,
              $create: Boolean,
              $forceHomonym: Boolean,
              $knownHomonyms: [String]
            ){
          createName(
              proposedName: $proposedName,
              create: $create,
              forceHomonym: $forceHomonym,
              knownHomonyms: $knownHomonyms
          ){
            name,
            success,
            message,
            names{
                id,
                wfo
            },
            children{
              name,
              success,
              message,
              names{
                  id,
                  wfo,
                  fullNameString
              }
            }
          }
        }
`;



function PageAdd(props) {

    const [proposedName, setProposedName] = useState();
    const [similarTo, setSimilarTo] = useState();
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [homonyms, setHomonyms] = useState([]);
    const [homonymsChecked, setHomonymsChecked] = useState([]);
    const [typingTimer, setTypingTimer] = useState();

    const [createName, { loading: mLoading }] = useMutation(CREATE_NAME, {
        variables: {
            proposedName: '',
            create: false,
            forceHomonym: false,
            knownHomonyms: []
        },
        refetchQueries: [
        ],
        update: (cache, mutationResult) => {

            if (!mutationResult.data.createName.success) {
                // something is wrong
                setButtonDisabled(true);

                mutationResult.data.createName.children.map(kid => {
                    if (kid.name === "HomonymsFound") {
                        console.log(kid);
                        if (kid.names && kid.names.length > 0) {
                            setHomonyms(kid.names);
                        } else {
                            setHomonyms([]);
                        }
                        setHomonymsChecked([]);
                    }
                    return true;
                });
            } else {
                // things are groovy

                setHomonyms([]);
                setHomonymsChecked([]);

                // did we actually create a new name?
                if (mutationResult.data.createName.names && mutationResult.data.createName.names.length > 0) {

                    // run create name again which will refresh the synonym list and button
                    createName({
                        variables: {
                            proposedName: proposedName,
                            create: false,
                            forceHomonym: false,
                            knownHomonyms: []
                        }
                    });

                    // send the people on their way
                    const newName = mutationResult.data.createName.names[0];
                    window.location.hash = newName.wfo;

                } else {
                    setButtonDisabled(false);
                }

            }

            // show some similar names
            setSimilarTo(proposedName);

        },
    });

    function handleSubmit(e) {

        e.preventDefault();

        let homonymWfos = [];
        homonyms.map(h => {
            return homonymWfos.push(h.wfo);
        });

        // do it for real
        createName({
            variables: {
                proposedName: proposedName,
                create: true,
                forceHomonym: homonyms.length > 0,
                knownHomonyms: homonymWfos
            }
        })
    }

    function handleNameChange(e) {

        let text = e.target.value;

        setProposedName(text);

        if (text.length < 3) {
            setButtonDisabled(true);
            setSimilarTo('');
            return;
        }

        // we wait a second after they stop typing
        // FIXME: This is the correct way to do the typing timer. Look for other places I've done it wrong.
        clearTimeout(typingTimer);
        setTypingTimer(setTimeout(() => {
            createName({
                variables: {
                    proposedName: text,
                    create: false,
                    forceHomonym: false,
                    knownHomonyms: []
                }
            })
        }, 500));

    }

    function handleHomonymCheck(e) {

        // prevent it going to the name
        e.stopPropagation();

        // work on a copy
        const checklist = [...homonymsChecked];

        // find the homonym that was checked
        homonyms.map(h => {
            if (e.target.id === `homonym-check-${h.id}`) {
                if (e.target.checked) {
                    // put the id in the list
                    checklist.push(h.id);
                } else {
                    // not checked so remove it
                    const i = checklist.indexOf(h.id);
                    if (i > -1) checklist.splice(i, 1);
                }
            }
            return true;
        });

        // run through the homonyms again to see if they 
        // are all checked now.
        let allChecked = true;
        homonyms.map(h => {
            if (checklist.indexOf(h.id) < 0) allChecked = false;
            return true;
        });

        if (allChecked) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }

        // keep the checklist for another time
        setHomonymsChecked(checklist);

    }

    let homonymsList = null;
    if (homonyms.length > 0) {
        homonymsList =
            <Form.Group className="mb-3" controlId="namePart">
                <Form.Label>Homonyms Found</Form.Label>
                <ListGroup>

                </ListGroup>
                {
                    homonyms.map(h => {
                        return (
                            <ListGroup.Item
                                action
                                key={h.id}
                                onClick={(e) => { e.preventDefault(); window.location.hash = h.wfo; }}
                            >
                                <Form.Check id={`homonym-check-${h.id}`} inline onClick={handleHomonymCheck} />
                                <span dangerouslySetInnerHTML={{ __html: h.fullNameString }} /> ({h.wfo})
                            </ListGroup.Item>
                        )
                    })
                }
                <Form.Text className="text-muted">
                    You must confirm you wish to create a homonym by checking the boxes next to the existing names.
                </Form.Text>
            </Form.Group>
    }

    //if (!name) return null;
    return (

        <Container fluid>
            <Row>
                <Col>
                    <Form onSubmit={handleSubmit}>
                        <Card bg="secondary" text="white" style={{ marginBottom: "1em" }} >
                            <Card.Header>Add Name</Card.Header>
                            <Card.Body style={{ backgroundColor: "white", color: "black" }}>

                                <Form.Group className="mb-3" controlId="namePart">
                                    <Form.Label>Proposed New Name String</Form.Label>
                                    <Form.Control type="text" placeholder="Enter the full name" onChange={handleNameChange} />
                                    <Form.Text className="text-muted">
                                        Enter the full name without rank or authors. It should just be 1, 2 or 3 words.
                                    </Form.Text>
                                </Form.Group>
                                {homonymsList}
                                <Form.Group controlId="submit-button" style={{ textAlign: "right", marginTop: "1em" }}>
                                    <Button disabled={buttonDisabled} variant="primary" type="submit" onClick={handleSubmit}>
                                        {mLoading ? "Loading..." : "Create"}
                                    </Button>
                                </Form.Group>
                            </Card.Body>

                        </Card>
                    </Form>
                    <CardNameSimilar nameString={similarTo} />
                </Col>
                <Col xs={4}>
                    <Card>
                        <Card.Header>Instructions</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                This form is used to add new names to the database.
                                The priority is not to create duplicated records and therefore mint new WFO IDs that will
                                later need to be merged. Only the minimum information needed to create an unplaced
                                name is collected initially. Further details can be added by editing the new record.
                            </Card.Text>
                        </Card.Body>

                    </Card>
                </Col>
            </Row>
        </Container>

    );

}
export default PageAdd