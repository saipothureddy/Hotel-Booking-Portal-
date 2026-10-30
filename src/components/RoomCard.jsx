function RoomCard({ room, onBook }) {
  return (
    <div className="col-lg-4 col-sm-6">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Room {room.roomNumber}</h5>
          <p className="mb-1">Type: {room.type}</p>
          <p className="mb-2">Price: Rs. {room.price} / night</p>
          <span className={room.available ? "badge bg-success" : "badge bg-danger"}>
            {room.available ? "Available" : "Booked"}
          </span>
        </div>
        {room.available && (
          <div className="card-footer bg-white">
            <button className="btn btn-primary btn-sm" onClick={() => onBook(room)}>
              Book Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomCard;
