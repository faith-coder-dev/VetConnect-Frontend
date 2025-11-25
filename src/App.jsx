

import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import VetsList from "./components/VetsList";
import VetDetails from "./components/VetDetails";
import BookAppointment from "./pages/BookAppointment";
import AddVetForm from "./components/AddVetForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

function App() {
  const [vets, setVets] = useState([]);

  useEffect(() => {
    // Load vets from db.json
    const loadVets = async () => {
      try {
        const res = await fetch('/db.json');
        if (res.ok) {
          const data = await res.json();
          setVets(data.vets || []);
        }
      } catch (err) {
        console.error('Error loading vets:', err);
      }
    };

    loadVets();
  }, []);


  const addVet = async (newVet) => {
    try {
      const res = await fetch("http://localhost:3001/vets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVet),
      });
      if (!res.ok) throw new Error('Failed to add vet');
      const data = await res.json();
      setVets(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      console.error("Error adding vet:", err);
      // Still add to state even if API fails
      const tempVet = { ...newVet, id: Date.now().toString() };
      setVets(prev => [...prev, tempVet]);
      return { success: false, data: tempVet, error: err.message };
    }
  };

  return (
    <>
      <NavBar />
      <div className="main-content">
        <Routes>

          <Route path="/" element={<Home vets={vets} />} />


          <Route path="/vets" element={<VetsList vets={vets} setVets={setVets} />} />


          <Route path="/vets/:id" element={<VetDetails />} />

          <Route path="/book" element={<BookAppointment />} />


          <Route path="/add-vet" element={<AddVetForm onAddVet={addVet} />} />


          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
