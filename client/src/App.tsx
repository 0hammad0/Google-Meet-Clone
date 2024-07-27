import { useEffect } from "react";
import "./App.css";
import socketIO from "socket.io-client";
import Home from "./pages/Home";

const WS = "http://localhost:8008";

function App() {
  useEffect(() => {
    socketIO(WS);
  }, []);

  return (
    <div className="App">
      <Home />
    </div>
  );
}

export default App;
