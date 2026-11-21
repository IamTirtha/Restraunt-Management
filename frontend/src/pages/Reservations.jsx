import { useState, useEffect } from "react";
import BookingForm from "../components/BookingForm";
import BookingList from "../components/BookingList";
import { api } from "../api";

function Reservations() {
  const [bookings, setBookings] = useState([]);
  const [alterations, setAlterations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("add"); // add | update | alter
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    Promise.all([api("/bookings"), api("/alterations")])
      .then(([b, a]) => {
        setBookings(b);
        setAlterations(a);
      })
      .catch((err) => {
        setIsError(true);
        setMessage(err.message);
      });
  }, []);

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const resetForm = () => {
    setSelected(null);
    setMode("add");
    setFormKey((k) => k + 1);
  };

  const handleSave = async (data) => {
    try {
      if (mode === "add") {
        const result = await api("/bookings", { method: "POST", body: data });
        setBookings([...bookings, result]);
        showMessage(`Table booked for ${result.customerName}.`);
      } else if (mode === "update") {
        const result = await api(`/bookings/${selected._id}`, { method: "PUT", body: data });
        setBookings(bookings.map((b) => (b._id === result._id ? result : b)));
        showMessage(
          `Thank you, ${result.customerName}! Your booking has been updated successfully. Total updates: ${result.updateCount}`
        );
      } else if (mode === "alter") {
        const result = await api(`/bookings/${selected._id}/alter`, { method: "POST", body: data });
        setAlterations([...alterations, result]);
        showMessage(`Alternative booking saved for ${result.customerName}.`);
      }
      resetForm();
    } catch (err) {
      showMessage(err.message, true);
    }
  };

  const handleEdit = (booking) => {
    setSelected(booking);
    setMode("update");
    setMessage("");
    setFormKey((k) => k + 1);
  };

  const handleAlter = (booking) => {
    setSelected(booking);
    setMode("alter");
    setMessage("");
    setFormKey((k) => k + 1);
  };

  const handleDelete = async (id) => {
    try {
      await api(`/bookings/${id}`, { method: "DELETE" });
      setBookings(bookings.filter((b) => b._id !== id));
      setAlterations(alterations.filter((a) => a.originalId !== id));
      showMessage("Booking deleted from both collections.");
      resetForm();
    } catch (err) {
      showMessage(err.message, true);
    }
  };

  return (
    <div>
      <h1>Table Reservation</h1>

      {message && (
        <div className={isError ? "message error-msg" : "message"}>{message}</div>
      )}

      <BookingForm
        key={formKey}
        mode={mode}
        selected={selected}
        onSave={handleSave}
        onCancel={resetForm}
      />

      <h2>Table Bookings</h2>
      <BookingList
        bookings={bookings}
        showActions={true}
        onEdit={handleEdit}
        onAlter={handleAlter}
        onDelete={handleDelete}
      />

      <h2>Altered Bookings</h2>
      <BookingList bookings={alterations} showActions={false} />
    </div>
  );
}

export default Reservations;