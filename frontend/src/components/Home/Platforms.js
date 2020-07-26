import React from "react";
import { Link } from "react-router-dom";

import "./Platforms.css";
import "../../constants/styles/Bootstrap.css";
import XboxLogo from "../../constants/icons/xbox.svg";
import SwitchLogo from "../../constants/icons/switch.svg";
import PlaystationLogo from "../../constants/icons/playstation.svg";

const Platforms = (props) => {
  return (
    <div className="btn-group container" role="group">
      <Link
        className="btn btn-light icon-btn"
        to={{ pathname: "/search", search: `platform=Xbox-One` }}
      >
        <img src={XboxLogo} height="100" alt="Xbox" />
      </Link>

      <Link
        className="btn btn-light icon-btn"
        to={{ pathname: "/search", search: `platform=PlayStation-4` }}
      >
        <img src={PlaystationLogo} height="100" alt="Playstation" />
      </Link>

      <Link
        className="btn btn-light icon-btn"
        to={{ pathname: "/search", search: `platform=Nintendo-Switch` }}
      >
        <img src={SwitchLogo} alt="Switch" height="100" />
      </Link>
    </div>
  );
};

export default Platforms;
