from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class Vet(Base):
    __tablename__ = "vets"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    location = Column(String(50), nullable=False)
    specialty = Column(String(50), nullable=False)
    contact = Column(String(50), nullable=False)
    image = Column(String)  
    likes = Column(Integer, default=0)
    rating = Column(Float, default=0.0)

    # vets can have many appointments
    appointments = relationship("Appointment", back_populates="vet")

   


class PetOwner(Base):
    __tablename__ = "pet_owners"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    contact_info = Column(String(50), nullable=False)

    # pet owners can have many pets
    pets = relationship("Pet", back_populates="owner")


class Pet(Base):
    __tablename__ = "pets"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    species = Column(String(50), nullable=False)
    owner_id = Column(Integer, ForeignKey("pet_owners.id"), nullable=False)

    owner = relationship("PetOwner", back_populates="pets")
    appointments = relationship("Appointment", back_populates="pet")


class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    time = Column(String(20), nullable=False)
    vet_id = Column(Integer, ForeignKey("vets.id"), nullable=False)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    description = Column(String(100)) 

    vet = relationship("Vet", back_populates="appointments")
    pet = relationship("Pet", back_populates="appointments")
