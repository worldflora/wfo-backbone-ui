import React, { useState } from "react";
import { useLazyQuery, gql } from "@apollo/client";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const STATS_QUERY = gql`
  query getStatsBasicSummary{
    getStatsBasicSummary{
    id,
    phylum,
    phylumWfo,
    order,
    orderWfo,
    family,
    familyWfo,
    taxa,
    withEditors,
    synonyms,
    unplaced,
    genera,
    species,
    subspecies,
    varieties,
    gbifGapSpecies,
    gbifGapOccurrences
  }
 }
`;


function PageAdd(props) {

    const [phylumFilter, setPhylumFilter] = useState(null);
    const [orderFilter, setOrderFilter] = useState(null);
    const [getStats, { data, loading }] = useLazyQuery(STATS_QUERY);

    let button = null;
    let table = null;
    let phylumSelect = null;
    let orderSelect = null;

    if (data) {
        table = (
            <>
                <Table striped bordered hover size="sm">
                    <thead>
                        <tr style={{ textAlign: "center" }}>
                            <th>Phylum</th>
                            <th>Order</th>
                            <th>Family</th>
                            <th>Taxa</th>
                            <th>With Editors</th>
                            <th>Synomyms</th>
                            <th>Unplaced</th>
                            <th>Genera</th>
                            <th>Species</th>
                            <th>Subspecies</th>
                            <th>Varieties</th>
                            <th>GBIF Gap Sp.</th>
                            <th>GBIF Gap Occ.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.getStatsBasicSummary.map(row => {

                            // we haven't set a phylum so we are rendering all phyla and nothing below
                            if (!phylumFilter && row.order) return null;

                            // if we have a phylumFilter but it doesn't match then don't render row
                            if (phylumFilter && phylumFilter !== row.phylum) return null;

                            // if we have picked a phylum but not selected an order then show order summaries
                            if (phylumFilter && !orderFilter && row.family) return null;

                            // if we have a orderFilter but it doesn't match then don't render row
                            if ((orderFilter && orderFilter !== row.order)) return null;

                            return (
                                <tr key={row.id}>
                                    <td>{row.phylum ? (row.phylumWfo ? <a href={'#' + row.phylumWfo}>{row.phylum}</a> : row.phylum) : "- Any -"}</td>
                                    <td>{row.order ? (row.orderWfo ? <a href={'#' + row.orderWfo}>{row.order}</a> : row.order) : "- Any -"}</td>
                                    <td>{row.family ? (row.familyWfo ? <a href={'#' + row.familyWfo}>{row.family}</a> : row.family) : "- Any -"}</td>
                                    <td style={{ textAlign: "right" }}>{row.taxa.toLocaleString("en-GB")}</td>
                                    <td style={{ textAlign: "right" }}>{row.withEditors.toLocaleString("en-GB")}</td>
                                    <td style={{ textAlign: "right" }}>{row.synonyms.toLocaleString("en-GB")}</td>
                                    <td style={{ textAlign: "right" }}>{row.unplaced.toLocaleString("en-GB")}</td>
                                    <td style={{ textAlign: "right" }}>{row.genera.toLocaleString("en-GB")}</td>
                                    <td style={{ textAlign: "right" }}>{row.species.toLocaleString("en-GB")}</td>
                                    <td style={{ textAlign: "right" }}>{row.subspecies.toLocaleString("en-GB")}</td>
                                    <td style={{ textAlign: "right" }}>{row.varieties.toLocaleString("en-GB")}</td>
                                    <td style={{ textAlign: "right" }}>{row.gbifGapSpecies.toLocaleString("en-GB")}</td>
                                    <td style={{ textAlign: "right" }}>{row.gbifGapOccurrences.toLocaleString("en-GB")}</td>
                                </tr>

                            );

                        })}

                    </tbody>
                </Table>
                <ul style={{ marginTop: "2em" }} >
                    <li>GBIF Gap Sp. = Unplaced species names with occurrences in GBIF.</li>
                    <li>GBIF Gap Occ. = Total occurrence records in GBIF tagged with unplaced species names.</li>
                </ul>
            </>
        );

        const phyla = [];
        data.getStatsBasicSummary.map(row => {
            if (row.phylum && !phyla.includes(row.phylum)) phyla.push(row.phylum);
            return null;
        });

        phylumSelect = (

            <Form.Group className="mb-3">
                <Form.Label>Filter by phylum</Form.Label>
                <Form.Select name="phylumSelect" style={{ width: "20em" }} onChange={e => { setPhylumFilter(e.target.value); setOrderFilter(null); }} value={phylumFilter} >
                    <option value="">- Summary -</option>
                    {
                        phyla.map(phylum => {
                            return (<option value={phylum}>{phylum}</option>);
                        })
                    }
                </Form.Select>
            </Form.Group>
        );

        if (phylumFilter) {

            const orders = [];
            data.getStatsBasicSummary.map(row => {
                if (row.phylum === phylumFilter && row.order && !orders.includes(row.order)) orders.push(row.order);
                return null;
            });

            orderSelect = (
                <Form.Group className="mb-3">
                    <Form.Label>Filter by order</Form.Label>
                    <Form.Select name="orderSelect" style={{ width: "20em" }} onChange={e => { setOrderFilter(e.target.value); }} value={orderFilter} >
                        <option value="">- Summary -</option>
                        {
                            orders.map(phylum => {
                                return (<option value={phylum}>{phylum}</option>);
                            })
                        }
                    </Form.Select>
                </Form.Group>
            );

        }


    } else {
        button = <Button variant="outline-secondary" onClick={getStats}>{loading ? "Loading ..." : "Fetch stats"}</Button>
    }

    return (
        <Container fluid>

            <p>
                It is difficult to produce comprehensible summary statistics for the complex hierarchical structure of taxonomy and nomenclature.
                Presented here is a summary of statistics based on counting by genus names and the taxa, synonyms and unplaced names associated with them.
                You can download the full data table or this summary table for further analysis under the <a href="#data">Data tab</a>.
                Unplaced names may be counted more than once here as they are included under any homonym or synonym they may be associated with.
                These stats are updated every few days.
            </p>

            {button}
            <Form>
                <Row>
                    <Col xs={3}>
                        {phylumSelect}
                    </Col>
                    <Col xs={3}>
                        {orderSelect}
                    </Col>
                </Row>
            </Form>

            {table}

        </Container>

    );



}
export default PageAdd