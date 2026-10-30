import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SearchRooms from "./pages/SearchRooms";
import Rooms from "./pages/Rooms";
import Customers from "./pages/Customers";
import Bookings from "./pages/Bookings";

function App() {
  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<SearchRooms />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
