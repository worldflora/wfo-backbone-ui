import React from "react";

function LinkOrcid(props) {

    if (!props.user.orcid) return null;
    return (
        <a href={"https://orcid.org/" + props.user.orcid} style={{ textDecoration: "none" }}>
            <img target="orcid" alt="ORCID logo" src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" width="16" height="16" />
            <span >&nbsp;</span>
            https://orcid.org/{props.user.orcid}
        </a>
    );

}
export default LinkOrcid