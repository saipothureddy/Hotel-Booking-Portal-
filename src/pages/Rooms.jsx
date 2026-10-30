import { useEffect, useState } from "react";
import { getData, postData, putData, deleteData } from "../api";
import { roomTypes } from "../roomTypes";

const emptyRoom = { roomNumber: "", type: "Single", price: "" };

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyRoom);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      setRooms(await getData("rooms"));
    } catch (err) {
      setError("Could not load rooms");
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.roomNumber.trim() === "") {
      setError("Room number is required");
      return;
    }
    if (Number(form.price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    const duplicate = rooms.find(
      (r) => r.roomNumber === form.roomNumber.trim() && r.id !== editId
    );
    if (duplicate) {
      setError("Room number already exists");
      return;
    }

    const roomData = {
      roomNumber: form.roomNumber.trim(),
      type: form.type,
      price: Number(form.price),
    };

    try {
      if (editId) {
        const old = rooms.find((r) => r.id === editId);
        await putData(`rooms/${editId}`, { ...roomData, available: old.available });
      } else {
        await postData("rooms", { ...roomData, available: true });
      }
      setForm(emptyRoom);
      setEditId(null);
      loadRooms();
    } catch (err) {
      setError("Could not save room");
    }
  }

  function handleEdit(room) {
    setEditId(room.id);
    setForm({ roomNumber: room.roomNumber, type: room.type, price: room.price });
  }

  async function handleDelete(room) {
    if (!room.available) {
      setError("Cannot delete a room that is currently booked");
      return;
    }
    if (!window.confirm(`Delete room ${room.roomNumber}?`)) return;
    try {
      await deleteData(`rooms/${room.id}`);
      loadRooms();
    } catch (err) {
      setError("Could not delete room");
    }
  }

  return (
    <div>
      <h2 className="mb-3">Manage Rooms</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="row g-2 p-3 mb-4 border bg-white" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <input className="form-control" name="roomNumber" placeholder="Room number" value={form.roomNumber} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <select className="form-select" name="type" value={form.type} onChange={handleChange}>
            {roomTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <input className="form-control" type="number" name="price" placeholder="Price per night" value={form.price} onChange={handleChange} />
        </div>
        <div className="col-md-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary">{editId ? "Update Room" : "Add Room"}</button>
          {editId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(emptyRoom); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="table table-bordered table-striped bg-white">
        <thead className="table-dark">
          <tr>
            <th>Room No</th>
            <th>Type</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.roomNumber}</td>
              <td>{room.type}</td>
              <td>{room.price}</td>
              <td>
                <span className={room.available ? "badge bg-success" : "badge bg-danger"}>
                  {room.available ? "Available" : "Booked"}
                </span>
              </td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(room)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(room)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Rooms;
