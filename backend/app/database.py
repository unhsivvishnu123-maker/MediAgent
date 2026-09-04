from datetime import datetime, timedelta
import uuid

DOCTORS = [
    {
        "id": "DOC001",
        "name": "Dr. Priya Sharma",
        "specialty": "Dermatologist",
        "hospital": "Apollo Care Center",
        "location": "Gurugram",
        "distance_km": 2.4,
        "rating": 4.8,
        "experience": "12 years",
        "consultation_fee": 800
    },
    {
        "id": "DOC002",
        "name": "Dr. Rahul Mehta",
        "specialty": "Dermatologist",
        "hospital": "Medanta Health Clinic",
        "location": "Gurugram",
        "distance_km": 4.1,
        "rating": 4.7,
        "experience": "10 years",
        "consultation_fee": 700
    },
    {
        "id": "DOC003",
        "name": "Dr. Ananya Kapoor",
        "specialty": "General Physician",
        "hospital": "Fortis Medical Center",
        "location": "Gurugram",
        "distance_km": 3.2,
        "rating": 4.9,
        "experience": "15 years",
        "consultation_fee": 600
    },
    {
        "id": "DOC004",
        "name": "Dr. Arjun Verma",
        "specialty": "Cardiologist",
        "hospital": "Max Healthcare",
        "location": "Gurugram",
        "distance_km": 5.3,
        "rating": 4.9,
        "experience": "18 years",
        "consultation_fee": 1200
    },
    {
        "id": "DOC005",
        "name": "Dr. Neha Singh",
        "specialty": "General Physician",
        "hospital": "CityCare Hospital",
        "location": "Gurugram",
        "distance_km": 1.8,
        "rating": 4.6,
        "experience": "8 years",
        "consultation_fee": 500
    }
]

APPOINTMENTS = []
REMINDERS = []


def get_doctor(doctor_id):
    return next(
        (d for d in DOCTORS if d["id"] == doctor_id),
        None
    )


def create_appointment(doctor_id, date, time, patient_name="Demo Patient"):
    appointment_id = "APT-" + uuid.uuid4().hex[:8].upper()

    appointment = {
        "id": appointment_id,
        "doctor_id": doctor_id,
        "date": date,
        "time": time,
        "patient_name": patient_name,
        "status": "confirmed",
        "created_at": datetime.now().isoformat()
    }

    APPOINTMENTS.append(appointment)

    return appointment


def get_appointment(appointment_id):
    return next(
        (a for a in APPOINTMENTS if a["id"] == appointment_id),
        None
    )


def create_reminder(appointment_id, minutes_before):
    reminder_id = "REM-" + uuid.uuid4().hex[:8].upper()

    reminder = {
        "id": reminder_id,
        "appointment_id": appointment_id,
        "minutes_before": minutes_before,
        "status": "scheduled"
    }

    REMINDERS.append(reminder)

    return reminder