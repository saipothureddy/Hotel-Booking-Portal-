import { useEffect, useState } from "react";
import { getData, postData, patchData } from "../api";
import { roomTypes } from "../roomTypes";
import RoomCard from "../components/RoomCard";

function SearchRooms() {
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [type, setType] = useState("All");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [booking, setBooking] = useState({ customerId: "", checkIn: "", checkOut: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const roomData = await getData("rooms");
      const customerData = await getData("customers");
      setRooms(roomData);
      setCustomers(customerData);
    } catch (err) {
      setError("Could not load data. Check if json-server is running.");
    }
  }

  const filteredRooms = rooms.filter((room) => {
    const typeMatch = type === "All" || room.type === type;
    const availableMatch = !onlyAvailable || room.available;
    return typeMatch && availableMatch;
  });

  function getNights() {
    if (!booking.checkIn || !booking.checkOut) return 0;
    const diff = new Date(booking.checkOut) - new Date(booking.checkIn);
    return diff / (1000 * 60 * 60 * 24);
  }

  function handleBook(room) {
    setSelectedRoom(room);
    setBooking({ customerId: "", checkIn: "", checkOut: "" });
    setMessage("");
    setError("");
  }

  function handleChange(e) {
    setBooking({ ...booking, [e.target.name]: e.target.value });
  }

  async function confirmBooking(e) {
    e.preventDefault();
    setError("");

    if (!booking.customerId || !booking.checkIn || !booking.checkOut) {
      setError("Please fill all the fields");
      return;
    }
    if (getNights() <= 0) {
      setError("Check-out date must be after check-in date");
      return;
    }

    const newBooking = {
      roomId: selectedRoom.id,
      customerId: Number(booking.customerId),
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalAmount: getNights() * selectedRoom.price,
      status: "Confirmed",
    };

    try {
      await postData("bookings", newBooking);
      await patchData(`rooms/${selectedRoom.id}`, { available: false });
      setMessage(`Room ${selectedRoom.roomNumber} booked successfully`);
      setSelectedRoom(null);
      loadData();
    } catch (err) {
      setError("Booking failed. Try again.");
    }
  }

  return (
    <div>
      <h2 className="mb-3">Search Rooms</h2>

      <div className="d-flex flex-wrap align-items-center gap-4 mb-3">
        <label className="d-flex align-items-center gap-2">
          Room Type:
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="All">All</option>
            {roomTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="availableOnly"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="availableOnly">Available only</label>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {selectedRoom && (
        <form className="row g-2 p-3 mb-4 border bg-white" onSubmit={confirmBooking}>
          <h5 className="col-12">Book Room {selectedRoom.roomNumber} ({selectedRoom.type})</h5>

          <div className="col-md-4">
            <select className="form-select" name="customerId" value={booking.customerId} onChange={handleChange}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <input className="form-control" type="date" name="checkIn" min={today} value={booking.checkIn} onChange={handleChange} />
          </div>

          <div className="col-md-4">
            <input className="form-control" type="date" name="checkOut" min={booking.checkIn || today} value={booking.checkOut} onChange={handleChange} />
          </div>

          {getNights() > 0 && (
            <p className="col-12 mb-0">
              Total: Rs. {getNights() * selectedRoom.price} for {getNights()} night(s)
            </p>
          )}

          <div className="col-12">
            <button type="submit" className="btn btn-primary me-2">Confirm Booking</button>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedRoom(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="row g-3">
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} onBook={handleBook} />
        ))}
      </div>

      {filteredRooms.length === 0 && <p>No rooms found.</p>}
    </div>
  );
}

export default SearchRooms;
