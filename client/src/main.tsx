import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import "./App.css";
import { RoomProvider } from "./context/RoomContext.tsx";
import Room from "./pages/Room.tsx";
import Home from "./pages/Home.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RoomProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:id" element={<Room />} />
        </Routes>
      </div>
    </RoomProvider>
  </BrowserRouter>
);
