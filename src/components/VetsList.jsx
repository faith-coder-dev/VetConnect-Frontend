import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

/*
  VetsList
  - Expects `vets` prop to be an array of veterinarian objects.
  - The app uses a static-first strategy: App sets vets from `public/vets.json` immediately,
    then tries to refresh from an API. This component just renders whatever `vets` it receives.
  - Small UX helpers are included (image fallback, like button state). These are non-destructive
    UI helpers and can be removed to return to a simpler original version if you prefer.
*/

function VetsList({ vets }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [showModal, setShowModal] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [likedVets, setLikedVets] = useState({});

  const filteredVets = (vets || []).filter((vet) => {
    const searchValue = searchTerm.toLowerCase();
    switch (searchField) {
      case "name":
        return vet?.name?.toLowerCase().includes(searchValue);
      case "location":
        return vet?.location?.toLowerCase().includes(searchValue);
      case "specialty":
        return vet?.specialty?.toLowerCase().includes(searchValue);
      case "contact":
        return vet?.contact?.toLowerCase().includes(searchValue);
      default:
        return true;
    }
  });

  const handleShow = (vet) => {
    setSelectedVet(vet);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedDate("");
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      // Create appointment object (json-server will auto-generate ID)
      const appointment = {
        vetName: selectedVet.name,
        petName: "",
        ownerName: "",
        date: selectedDate,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      };

      // POST to json-server which will auto-save to db.json
      const res = await fetch('http://localhost:3001/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment)
      });

      if (res.ok) {
        alert(`Appointment booked with ${selectedVet.name} on ${selectedDate}!`);
        handleClose();
      } else {
        alert('Error booking appointment. Please try again.');
        handleClose();
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      alert('Error: Make sure json-server is running on port 3001');
      handleClose();
    }
  };

  const handleLike = (id) => {
    setLikedVets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };


  if (!vets || vets.length === 0) {
    return (
      <div className="container my-5 text-center">
        <h2 className="fw-bold" style={{ color: "#28a745" }}>
          Meet Our Veterinarians
        </h2>
        <div className="mt-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading veterinarians...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: "#28a745" }}>
          Meet Our Veterinarians
        </h2>
        <div className="mt-3" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div className="input-group shadow-sm">
            <select
              className="form-select"
              style={{ maxWidth: "150px" }}
              value={searchField}
              onChange={(e) => {
                setSearchField(e.target.value);
                setSearchTerm("");
              }}
            >
              <option value="name">Name</option>
              <option value="location">Location</option>
              <option value="specialty">Specialty</option>
              <option value="contact">Contact</option>
            </select>
            <input
              type="text"
              className="form-control"
              placeholder={`Filter by ${searchField}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row">
        {filteredVets.length > 0 ? (
          filteredVets.map((vet) => (
            <div key={vet.id} className="col-md-4 mb-4">
              <div
                className="card shadow-sm h-100 border-0 rounded-4 hover-card"
                style={{
                  transition: "transform 0.3s, box-shadow 0.3s",
                  overflow: "hidden",
                }}
              >
                <img
                  src={vet.image}
                  alt={vet.name}
                  className="card-img-top rounded-top-4"
                  style={{ height: "250px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x250?text=Vet+Image";
                  }}
                />
                <div className="card-body text-center">
                  <h5 className="fw-bold" style={{ color: "#28a745" }}>
                    {vet.name}
                  </h5>
                  <p className="text-muted">{vet.specialty}</p>

                  <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                    <div>
                      {[...Array(Math.floor(vet.rating || 0))].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-warning"></i>
                      ))}
                      {vet.rating % 1 >= 0.5 && (
                        <i className="bi bi-star-half text-warning"></i>
                      )}
                      {[...Array(5 - Math.ceil(vet.rating || 0))].map((_, i) => (
                        <i key={`empty-${i}`} className="bi bi-star text-warning"></i>
                      ))}
                    </div>
                    <button
                      className="btn btn-light btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                      onClick={() => handleLike(vet.id)}
                      style={{
                        width: "36px",
                        height: "36px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <i
                        className={`bi ${likedVets[vet.id]
                          ? "bi-heart-fill text-danger"
                          : "bi-heart text-secondary"
                          }`}
                      ></i>
                    </button>
                    <span className="text-muted small">
                      {(vet.likes || 0) + (likedVets[vet.id] ? 1 : 0)} Likes
                    </span>
                  </div>

                  <div className="d-flex justify-content-center gap-2">
                    <Link
                      to={`/vets/${vet.id}`}
                      className="btn"
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        borderRadius: "10px",
                        fontWeight: "600",
                      }}
                    >
                      View Profile
                    </Link>
                    <Button
                      onClick={() => handleShow(vet)}
                      style={{
                        backgroundColor: "#ff66a3",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                      }}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted mt-4">No veterinarians found.</p>
        )}
      </div>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Book Appointment {selectedVet ? `with ${selectedVet.name}` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleBook}>
            <Form.Group>
              <Form.Label>Select Date</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>
            <div className="text-end mt-3">
              <Button
                type="submit"
                style={{
                  backgroundColor: "#28a745",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Confirm Booking
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default VetsList;