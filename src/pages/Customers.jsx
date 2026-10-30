import { useEffect, useState } from "react";
import { getData, postData, putData, deleteData } from "../api";

const emptyCustomer = { name: "", phone: "", email: "" };

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyCustomer);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setCustomers(await getData("customers"));
    } catch (err) {
      setError("Could not load customers");
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.name.trim() === "") {
      setError("Name is required");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError("Phone number must be 10 digits");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    try {
      if (editId) {
        await putData(`customers/${editId}`, form);
      } else {
        await postData("customers", form);
      }
      setForm(emptyCustomer);
      setEditId(null);
      loadCustomers();
    } catch (err) {
      setError("Could not save customer");
    }
  }

  function handleEdit(customer) {
    setEditId(customer.id);
    setForm({ name: customer.name, phone: customer.phone, email: customer.email });
    window.scrollTo(0, 0);
  }

  async function handleDelete(customer) {
    try {
      const active = await getData(`bookings?customerId=${customer.id}&status=Confirmed`);
      if (active.length > 0) {
        setError("This customer has an active booking, cannot delete");
        return;
      }
      if (!window.confirm(`Delete ${customer.name}?`)) return;
      await deleteData(`customers/${customer.id}`);
      loadCustomers();
    } catch (err) {
      setError("Could not delete customer");
    }
  }

  const text = search.trim().toLowerCase();

  const filteredCustomers = customers.filter((c) => {
    return (
      String(c.id) === text ||
      c.name.toLowerCase().includes(text) ||
      c.phone.includes(text)
    );
  });

  const totalPages = Math.ceil(filteredCustomers.length / perPage) || 1;
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageCustomers = filteredCustomers.slice(start, start + perPage);

  return (
    <div>
      <h2 className="mb-3">Manage Customers</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="row g-2 p-3 mb-4 border bg-white" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <input className="form-control" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input className="form-control" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <input className="form-control" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        </div>
        <div className="col-md-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary">{editId ? "Update Customer" : "Add Customer"}</button>
          {editId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(emptyCustomer); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="row mb-3">
        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="Search by ID, name or phone"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="col-md-7 d-flex align-items-center">
          Showing {pageCustomers.length} of {filteredCustomers.length} customers
        </div>
      </div>

      <table className="table table-bordered table-striped bg-white">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pageCustomers.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(c)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredCustomers.length === 0 && <p>No customers found.</p>}

      <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Customers;