import { useState, useEffect } from "react";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [bookings, setBookings] = useState([]);
  const [alterations, setAlterations] = useState([]);
  const [selected, setSelected] = useState(null); // booking being edited
  const [mode, setMode] = useState("add");        // add | update | alter
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [formKey, setFormKey] = useState(0);      // changing this resets the form

  // Load data from MongoDB when the page opens
  useEffect(() => {
    Promise.all([
      fetch(`${API}/bookings`).then((r) => r.json()),
      fetch(`${API}/alterations`).then((r) => r.json()),
    ])
      .then(([b, a]) => {
        setBookings(b);
        setAlterations(a);
      })
      .catch(() => {
        setIsError(true);
        setMessage("Cannot reach the server. Is the backend running?");
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
      let url = `${API}/bookings`;
      let method = "POST";

      if (mode === "update") {
        url = `${API}/bookings/${selected._id}`;
        method = "PUT";
      } else if (mode === "alter") {
        url = `${API}/bookings/${selected._id}/alter`;
        method = "POST";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      // Server-side validation failed
      if (!res.ok) {
        showMessage((result.errors || [result.message]).join(". "), true);
        return;
      }

      if (mode === "add") {
        setBookings([...bookings, result]);
        showMessage(`Table booked for ${result.customerName}.`);
      } else if (mode === "update") {
        setBookings(bookings.map((b) => (b._id === result._id ? result : b)));
        showMessage(
          `Thank you, ${result.customerName}! Your booking has been updated successfully. Total updates: ${result.updateCount}`
        );
      } else if (mode === "alter") {
        setAlterations([...alterations, result]);
        showMessage(`Alternative booking saved for ${result.customerName}.`);
      }
      resetForm();
    } catch {
      showMessage("Cannot reach the server. Is the backend running?", true);
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
      const res = await fetch(`${API}/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        showMessage("Could not delete the booking.", true);
        return;
      }
      setBookings(bookings.filter((b) => b._id !== id));
      setAlterations(alterations.filter((a) => a.originalId !== id));
      showMessage("Booking deleted from both collections.");
      resetForm();
    } catch {
      showMessage("Cannot reach the server. Is the backend running?", true);
    }
  };

  return (
    <div className="container">
      <h1>Restaurant Management System</h1>

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

export default App;