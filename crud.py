import json
from datetime import datetime
from sqlalchemy.orm import Session
from models import Vet, PetOwner, Pet, Appointment

def seed_vets(session: Session, data):
    for vet_data in data.get("vets", []):
        vet = Vet(
            id=int(vet_data["id"]),
            name=vet_data["name"],
            location=vet_data["location"],
            specialty=vet_data["specialty"],
            contact=vet_data["contact"],
            image=vet_data.get("image"),
            likes=vet_data.get("likes", 0),
            rating=vet_data.get("rating", 0.0)
        )
        session.merge(vet)
    session.commit()

def seed_appointments(session: Session, data):
    owners_created = {}
    pets_created = {}

    for appointment_data in data.get("appointments", []):
        owner_name = appointment_data["ownerName"]
        pet_name = appointment_data["petName"]

        # Create owner if not exists
        if owner_name not in owners_created:
            owner = PetOwner(name=owner_name, contact_info="N/A")
            owner = session.merge(owner)
            session.flush()
            owners_created[owner_name] = owner
        else:
            owner = owners_created[owner_name]

        # Create pet if not exists
        if pet_name not in pets_created:
            pet = Pet(name=pet_name, species="Unknown", owner_id=owner.id)
            session.add(pet)
            session.flush()
            pets_created[pet_name] = pet
        else:
            pet = pets_created[pet_name]

        # Find vet
        vet = session.query(Vet).filter(Vet.name == appointment_data["vetName"]).first()
        if not vet:
            print(f"Skipping appointment: Vet {appointment_data['vetName']} not found")
            continue

        # Add appointment
        appointment = Appointment(
            date=datetime.strptime(appointment_data["date"], "%Y-%m-%d").date(),
            time=appointment_data["time"],
            vet_id=vet.id,
            pet_id=pet.id,
            description="No additional notes"
        )
        session.add(appointment)

    session.commit()
    print("All data added to the database successfully!")


def view_vets(session: Session):
    vets = session.query(Vet).all()
    print("\n--- ALL VETS ---")
    if not vets:
        print("No vets found.")
        return
    for vet in vets:
        print(f"{vet.id}: {vet.name} | {vet.specialty} | {vet.location} | Contact: {vet.contact} | Rating: {vet.rating} | Likes: {vet.likes}")

def view_pets(session: Session):
    pets = session.query(Pet).all()
    print("\n--- ALL PETS ---")
    if not pets:
        print("No pets found.")
        return
    for pet in pets:
        print(f"{pet.id}: {pet.name} | Species: {pet.species} | Owner: {pet.owner.name}")

def view_owners(session: Session):
    owners = session.query(PetOwner).all()
    print("\n--- ALL PET OWNERS ---")
    if not owners:
        print("No owners found.")
        return
    for owner in owners:
        print(f"{owner.id}: {owner.name} | Contact: {owner.contact_info}")

def view_appointments(session: Session):
    appointments = session.query(Appointment).all()
    print("\n--- ALL APPOINTMENTS ---")
    if not appointments:
        print("No appointments found.")
        return
    for appt in appointments:
        print(f"{appt.id}: {appt.date} at {appt.time} | Vet: {appt.vet.name} | Pet: {appt.pet.name} | Owner: {appt.pet.owner.name} | Notes: {appt.description}")
