import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"

import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import assert from "assert"

dayjs.extend(duration)

assert(
  process.env.REACT_APP_TOGGL_API_TOKEN,
  "No Toggl API Token found. Add it to your .env file or something yo"
)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
)
