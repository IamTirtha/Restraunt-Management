import { useState } from "react";

const emptyForm = {
  customerName: "",
  phone: "",
  seatingArea: "Indoor",
  guests: 1,
  bookingDate: "",
  bookingTime: "",
  remarks: "",
};

function BookingForm({ mode, selected, onSave, onCancel }) {
  // Start with the selected booking's values (Update / Alter), or an empty form
  const [form, setForm] = useState(
    selected
      ? {
          customerName: selected.customerName,
          phone: selected.phone,
          seatingArea: selected.seatingArea,
          guests: selected.guests,
          bookingDate: selected.bookingDate,
          bookingTime: selected.bookingTime,
          remarks: selected.remarks,
        }
      : emptyForm
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Constraints (Experiment 2)
  const validate = () => {
    const err = {};
    if (!form.customerName.trim()) err.customerName = "Name is required";
    else if (!/^[A-Za-z ]+$/.test(form.customerName))
      err.customerName = "Name can contain letters only";

    if (!/^[6-9]\d{9}$/.test(form.phone))
      err.phone = "Enter a valid 10-digit phone number";

    const guests = Number(form.guests);
    if (guests < 1 || guests > 10) err.guests = "Guests must be between 1 and 10";

    const today = new Date().toISOString().split("T")[0];
    if (!form.bookingDate) err.bookingDate = "Booking date is required";
    else if (form.bookingDate < today)
      err.bookingDate = "Booking date cannot be in the past";

    if (!form.bookingTime) err.bookingTime = "Booking time is required";
    else if (form.bookingTime < "11:00" || form.bookingTime > "23:00")
      err.bookingTime = "Restaurant is open from 11:00 AM to 11:00 PM";

    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length === 0) {
      onSave({ ...form, guests: Number(form.guests) });
    }
  };

  const titles = {
    add: "New Table Booking",
    update: "Update Booking",
    alter: "Create Altered Booking",
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{titles[mode]}</h2>

      <label>Customer Name</label>
      <input name="customerName" value={form.customerName} onChange={handleChange} />
      {errors.customerName && <p className="error">{errors.customerName}</p>}

      <label>Phone Number</label>
      <input name="phone" value={form.phone} onChange={handleChange} maxLength={10} />
      {errors.phone && <p className="error">{errors.phone}</p>}

      <label>Seating Area</label>
      <select name="seatingArea" value={form.seatingArea} onChange={handleChange}>
        <option>Indoor</option>
        <option>Outdoor</option>
        <option>Private Dining</option>
        <option>Bar</option>
      </select>

      <label>Number of Guests (1-10)</label>
      <input type="number" name="guests" value={form.guests} onChange={handleChange} />
      {errors.guests && <p className="error">{errors.guests}</p>}

      <label>Booking Date</label>
      <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} />
      {errors.bookingDate && <p className="error">{errors.bookingDate}</p>}

      <label>Booking Time</label>
      <input type="time" name="bookingTime" value={form.bookingTime} onChange={handleChange} />
      {errors.bookingTime && <p className="error">{errors.bookingTime}</p>}

      <label>Remarks</label>
      <textarea name="remarks" value={form.remarks} onChange={handleChange} />

      <div className="btn-row">
        <button type="submit" className="btn primary">
          {mode === "add" ? "Book Table" : "Save"}
        </button>
        {mode !== "add" && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default BookingForm;