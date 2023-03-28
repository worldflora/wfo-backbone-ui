
import React, { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Form from "react-bootstrap/Form";

const SELECT_USER_QUERY = gql`
  query getPossibleEditors{
        getPossibleEditors{
            id,
            name
        }
 }
`;

function SelectUser(props) {

    const { data } = useQuery(SELECT_USER_QUERY);
    if (!data) return null;

    console.log(data);

    return (
        <Form.Select size="sm" aria-label="Filter to one user" value={props.userId} onChange={e => props.setUserId(parseInt(e.currentTarget.value))}>
            <option>- All Users -</option>
            {
                data.getPossibleEditors.map(user => {
                    return(
                        <option key={user.id} value={user.id}>{user.name}</option>
                    )
                })
            }
        </Form.Select>
    );

}
export default SelectUser