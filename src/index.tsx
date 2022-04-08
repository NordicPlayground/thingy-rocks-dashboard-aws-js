import * as React from "react";
import * as ReactDOM from "react-dom";
import { ThingyWorld } from "./components/App";
import { Ion } from "cesium";

import "bootstrap/scss/bootstrap.scss";
import "./global.scss";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4Y2U2ODRlMS0zYzBkLTRmNjQtYTlkOC1mMjg0MGY4NWIyNzEiLCJpZCI6NjExMTAsImlhdCI6MTYzODgxODYyMH0.Vu8wJT7AmTneNnboUooMyNFFLgG0sDiBeOIG5qAOEAw";

ReactDOM.render(<ThingyWorld />, document.getElementById("output"));
