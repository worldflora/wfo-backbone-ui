import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from 'react-bootstrap/Tab';
import Tabs from "react-bootstrap/Tabs";
import Modal from "react-bootstrap/Modal";
import { useMutation, useQuery, gql } from "@apollo/client";
import AlertUpdate from "./AlertUpdate";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Badge from "react-bootstrap/Badge";

const DESCRIPTION_QUERY = gql`
   query getTaxonDescription($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            canEdit,
            taxonPlacement{
                id,
                descriptionMarkDown,
                descriptionComplete
                acceptedName{
                    id
                }
            }
        }
    }
`;

const UPDATE_DESCRIPTION = gql`
        mutation  updateTaxonDescription(
            $wfo: String!,
            $descriptionMarkDown: String!,
            $descriptionComplete: Boolean!
            ){
          updateTaxonDescription(
              wfo: $wfo,
              descriptionMarkDown: $status,
              descriptionComplete: $descriptionComplete
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

function CardTaxonDescription(props) {

    const [wfo, setWfo] = useState();
    const [descriptionMarkDown, setDescriptionMarkDown] = useState();
    const [descriptionComplete, setDescriptionComplete] = useState();
    const [show, setShow] = useState(false);
    const [displayText, setDisplayText] = useState(false);

    const { loading, error, data } = useQuery(DESCRIPTION_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updateNameStatus, { loading: mLoading, data: mData }] = useMutation(UPDATE_DESCRIPTION, {
        refetchQueries: [
            DESCRIPTION_QUERY
        ]
    });



    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    let name = data ? data.getNameForWfoId : null;
    let taxon = null;

    // we don't render if we are unplaced or a synonym
    if (!name || !name.taxonPlacement || name.id !== name.taxonPlacement.acceptedName.id) {
        return null;
    } else {
        taxon = name.taxonPlacement;
    }



    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
        setDescriptionMarkDown(taxon.descriptionMarkDown);
        setDescriptionComplete(taxon.descriptionComplete);
    }

    function handleSubmit(event) {
        event.preventDefault();
        updateNameStatus(
            {
                variables: {
                    wfo: props.wfo,
                    descriptionMarkDown: descriptionMarkDown,
                    descriptionComplete: descriptionComplete
                }
            }
        );
    }

    function textChanged(event){
        let newText = event.target.value;
        setDisplayText(newText);
    }


    return (
        <>
            <Card bg="warning" text="dark" style={{ marginBottom: "1em" }}>
                <Card.Header>
                    <OverlayTrigger
                        key="CardNameStatus-tooltip-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`CardNameStatus-tooltip-text`}>
                                You can add a formatted description of the taxon.
                            </Tooltip>
                        }
                    >
                        <span>Taxon description</span>
                    </OverlayTrigger>
                    <span style={{ fontSize: "80%", verticalAlign: "super", cursor: "pointer" }} >{' '}<Badge onClick={(handleShow)} >Edit</Badge></span>
                </Card.Header>
                <Card.Body style={{ backgroundColor: "white", color: "gray" }} >
                    Some text in here to show stuff.
                </Card.Body>
            </Card>
            <Modal show={show} onHide={handleClose} size="lg" >
                <Modal.Header closeButton>
                    <Modal.Title>Edit description</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        defaultActiveKey="preview"
                        id="uncontrolled-tab-example"
                        className="mb-3"

                    >
                        <Tab eventKey="preview" title="Preview" >
                            <Container fluid>
                                <Row>
                                    <Col>
                                        <div>
                                            {displayText}
                                        </div>
                                    </Col>
                                    <Col style={{}}>
                                        <Form.Control
                                            as="textarea"
                                            placeholder="Type your description here."
                                            id="description_md"
                                            onChange={textChanged}
                                            style={{ height: '30em' }}
                                        />
                                    </Col>
                                </Row>
                            </Container>
                        </Tab>
                        <Tab eventKey="Help" title="Help">
                            <div style={{ maxHeight: "25em", overflowY: "scroll" }}>
                                <h2>Caution, experimental functionality!</h2>
                                <p>The intention here is to allow taxonomic experts to enter their own descriptions
                                    for the taxa they are curating. It has not been agreed how or even if these descriptions will
                                    be exposed to a wider audience. Ideas include publishing them in the portal
                                    as if they came from a flora or facilitating download of
                                    accounts as the basis for separate, more formal publication. If entering descriptions is useful
                                    please engage with the WFO Taxonomic Working Group and make sure your needs are understood.
                                </p>
                                <h2>Text formatting</h2>
                                <p>Descriptions are written in plain text but we follow some conventions to make presentation
                                    clearer. As we are in an experimental period treat these like guidelines and feedback with any recommendations.</p>

                                <h3>Lead Paragraph</h3>

                                <p>The first paragraph should be in the style of
                                    a <a href="https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lead_section" target="wikipedia" >Wikipedia Lead Section</a>.
                                    It should be no more than 150 words long and introduce the taxon to someone who has absolutely no idea
                                    what this organism is without distracting experts who are after the details. A good formula might be an overview
                                    sentence: "A large tropical tree native to East Asia." A somewhat diagnostic sentence: "Differentiated from related trees by yellow sap when the bark is slashed."
                                    followed by a noteworthy sentence: "Endangered in the wild."
                                </p>

                                <h3>Sections</h3>
                                <p>
                                    After the first paragraph content is arranged into sections.
                                    If a keyword appears on its own on a line then it is considered to be the start of a section.
                                    Four sections are recognised initially:
                                </p>
                                <ul>
                                    <li><strong>Morphology</strong> The form and structure of the plant.
                                        This includes aspects of the outward appearance: habit, duration, sex, roots, stems, leaves,
                                        inflorescences, flowers, fruit, seeds (or equivalents for non-angiosperms) - in that order.</li>
                                    <li><strong>Habitat</strong> The array of factors that are present in an area,
                                        such as to support the survival and reproduction of a particular taxon,
                                        a physical manifestation of its ecological niche. </li>
                                    <li><strong>Distribution</strong> A narrative description of the geographic limits of the taxon's range.
                                        This may include regions and countries as well as climatic and topographic zones and native, introduced or invasive status.</li>
                                    <li><strong>Notes</strong> Comments on anything of note not included above.</li>
                                </ul>

                                <h3>Morphological structures</h3>

                                <p>Morphological descriptions are composed of short sentences each describing a separate structure.
                                    If it is necessary to break the sentence into clauses they should be separated by semicolons.
                                    At the beginning of each sentence and after each semicolon there must be a noun, and all the description
                                    (until the end of the sentence or until a semicolon) must refer back to that noun.
                                    Commas are used to separate the various components within the sentence. When characters are given in series,
                                    a comma will separate each component of the series and before the final "and" (e.g., "branchlets, petioles, and peduncles tomentose").</p>
                                <p>To help write in this structured way the preview pane on the left will display a colour coded version of the description.
                                    When the presented in the interface the structures described will be highlighted.
                                </p>
                            </div>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );

}
export default CardTaxonDescription;
