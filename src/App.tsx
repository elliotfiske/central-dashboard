import React from "react"
import "./App.css"
import TogglHeader from "./components/toggl-header"
import ThemeHeader from "./components/theme-header"
import { Provider } from "react-redux"
import { store } from "./model/store"
import HabitTrackDateChooser from "./components/habit-track-date-chooser"

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <ThemeHeader />
        <TogglHeader />
        <HabitTrackDateChooser />
      </Provider>
    </div>
  )
}

export default App
