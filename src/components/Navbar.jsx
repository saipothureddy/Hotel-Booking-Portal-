import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark px-3">
      <span className="navbar-brand"><h2>Hotel Booking Portal🏩</h2></span>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#menu"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="menu">
        <div className="navbar-nav ms-auto">
          <NavLink className="nav-link" to="/" end>Search Rooms🔎</NavLink>
          <NavLink className="nav-link" to="/rooms">Rooms🏨</NavLink>
          <NavLink className="nav-link" to="/customers">Customers👥</NavLink>
          <NavLink className="nav-link" to="/bookings">Bookings📅</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
