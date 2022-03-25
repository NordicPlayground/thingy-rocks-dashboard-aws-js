import * as React from "react";
import * as ReactDOM from "react-dom";

import "bootstrap/scss/bootstrap.scss";
import "./global.scss";
import { ThingyWorld } from "./components/App";

ReactDOM.render(<ThingyWorld />, document.getElementById("output"));
