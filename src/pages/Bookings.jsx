import { useEffect, useState } from "react";
import { getData, patchData, expireOldBookings } from "../api";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await expireOldBookings();
      setBookings(await getData("bookings"));
      setRooms(await getData("rooms"));
      setCustomers(await getData("customers"));
    } catch (err) {
      setError("Could not load bookings");
    }
  }

  function getRoomNumber(id) {
    const room = rooms.find((r) => r.id === id);
    return room ? room.roomNumber : "-";
  }

  function getCustomerName(id) {
    const customer = customers.find((c) => c.id === id);
    return customer ? customer.name : "-";
  }

  async function cancelBooking(booking) {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await patchData(`bookings/${booking.id}`, { status: "Cancelled" });
      await patchData(`rooms/${booking.roomId}`, { available: true });
      loadData();
    } catch (err) {
      setError("Could not cancel booking");
    }
  }

  return (
    <div>
      <h2 className="mb-3">Bookings</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-bordered table-striped bg-white">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{getCustomerName(b.customerId)}</td>
                <td>{getRoomNumber(b.roomId)}</td>
                <td>{b.checkIn}</td>
                <td>{b.checkOut}</td>
                <td>{b.totalAmount}</td>
                <td>
                  <span
                    className={
                      b.status === "Confirmed"
                        ? "badge bg-success"
                        : b.status === "Completed"
                        ? "badge bg-secondary"
                        : "badge bg-danger"
                    }
                  >
                    {b.status}
                  </span>
                </td>
                <td>
                  {b.status === "Confirmed" && (
                    <button className="btn btn-sm btn-danger" onClick={() => cancelBooking(b)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && <p>No bookings yet.</p>}
    </div>
  );
}

export default Bookings;