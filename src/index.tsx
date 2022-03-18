import * as React from "react";
import * as ReactDOM from "react-dom";

import { HelloWorld } from "./components/App";

import "bootstrap/scss/bootstrap.scss";
import "./global.scss";

ReactDOM.render(<HelloWorld />, document.getElementById("output"));
