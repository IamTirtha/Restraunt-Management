function BookingList({ bookings, showActions, onEdit, onAlter, onDelete }) {
  if (bookings.length === 0) {
    return <p className="empty">No records yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Seating</th>
          <th>Guests</th>
          <th>Date</th>
          <th>Time</th>
          {showActions && <th>Updates</th>}
          {showActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b._id}>
            <td>{b.customerName}</td>
            <td>{b.phone}</td>
            <td>{b.seatingArea}</td>
            <td>{b.guests}</td>
            <td>{b.bookingDate}</td>
            <td>{b.bookingTime}</td>
            {showActions && <td>{b.updateCount}</td>}
            {showActions && (
              <td>
                <button className="btn small" onClick={() => onEdit(b)}>Update</button>
                <button className="btn small" onClick={() => onAlter(b)}>Alter</button>
                <button className="btn small danger" onClick={() => onDelete(b._id)}>Delete</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BookingList;