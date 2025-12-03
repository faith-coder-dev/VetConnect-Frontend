import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
from crud import seed_vets, seed_appointments, view_vets, view_pets, view_owners, view_appointments

DATABASE_URL = "sqlite:///vetconnect.db"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

with open("db.json") as json_file:
    data = json.load(json_file)

def main_menu():
    while True:
        print("\n===== VETCONNECT CLI =====")
        print("1. Seed vets from db.json")
        print("2. Seed appointments from db.json")
        print("3. View all vets")
        print("4. View all pets")
        print("5. View all pet owners")
        print("6. View all appointments")
        print("7. Exit")
        choice = input("Enter choice: ")

        if choice == "1":
            seed_vets(session, data)
        elif choice == "2":
            seed_appointments(session, data)
        elif choice == "3":
            view_vets(session)
        elif choice == "4":
            view_pets(session)
        elif choice == "5":
            view_owners(session)
        elif choice == "6":
            view_appointments(session)
        elif choice == "7":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Try again.")

if __name__ == "__main__":
    main_menu()
