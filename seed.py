import json
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Vet, PetOwner, Pet, Appointment


DATABASE_URL = "sqlite:///vetconnect.db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

with open("db.json") as json_file:
    data = json.load(json_file)


for vet_data in data.get("vets", []):
    vet = Vet(
        id=int(vet_data["id"]),
        name=vet_data["name"],
        location=vet_data["location"],
        specialty=vet_data["specialty"],
        contact=vet_data["contact"],
        image=vet_data.get("image"),
        likes=vet_data.get("likes", 0),
        rating=vet_data.get("rating", 0.0),
    )
    session.merge(vet)  
owners_created = {}
pets_created = {}

for appointment_data in data.get("appointments", []):
    owner_name = appointment_data["ownerName"]
    pet_name = appointment_data["petName"]

    # Create Pet Owner if not already created
    if owner_name not in owners_created:
        pet_owner = PetOwner(name=owner_name, contact_info="N/A")
        pet_owner = session.merge(pet_owner)  
        session.flush() 
        owners_created[owner_name] = pet_owner
    else:
        pet_owner = owners_created[owner_name]

    # Create Pet if not already created
    if pet_name not in pets_created:
        pet = Pet(name=pet_name, species="Unknown", owner_id=pet_owner.id)
        session.add(pet)
        session.flush()
        pets_created[pet_name] = pet
    else:
        pet = pets_created[pet_name]

    # Find Vet
    vet = session.query(Vet).filter(Vet.name == appointment_data["vetName"]).first()
    if vet is None:
        print(f"Skipping appointment: Vet {appointment_data['vetName']} not found")
        continue

    
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
