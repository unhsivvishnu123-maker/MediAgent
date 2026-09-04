from datetime import datetime
from app.database import (
    DOCTORS,
    get_doctor,
    create_appointment,
    get_appointment,
    create_reminder
)


# ============================================================
# DOCTOR SEARCH
# ============================================================

def search_doctors(
    specialty: str,
    location: str = "Gurugram"
):

    results = [
        doctor
        for doctor in DOCTORS
        if specialty.lower() in doctor["specialty"].lower()
        and location.lower() in doctor["location"].lower()
    ]

    return {
        "success": True,
        "count": len(results),
        "doctors": results
    }


# ============================================================
# AVAILABILITY
# ============================================================

def check_availability(
    doctor_id: str,
    date: str
):

    # Validate date
    try:

        requested_date = datetime.strptime(
            date,
            "%Y-%m-%d"
        ).date()

    except ValueError:

        return {
            "success": False,
            "error": "Invalid date. Use YYYY-MM-DD."
        }

    # Prevent past dates
    today = datetime.now().date()

    if requested_date < today:

        return {
            "success": False,
            "error": (
                f"Cannot check availability for a past date. "
                f"Today is {today.isoformat()}."
            )
        }

    doctor = get_doctor(doctor_id)

    if not doctor:

        return {
            "success": False,
            "error": "Doctor not found."
        }

    # Simulated availability
    slots = [
        "09:00",
        "10:30",
        "12:00",
        "15:00",
        "17:30",
        "18:30",
        "20:00"
    ]

    return {
        "success": True,
        "doctor_id": doctor_id,
        "doctor_name": doctor["name"],
        "date": date,
        "available_slots": slots
    }


# ============================================================
# BOOK APPOINTMENT
# ============================================================

def book_appointment(
    doctor_id: str,
    date: str,
    time: str,
    patient_name: str = "Demo Patient"
):

    # Validate date
    try:

        requested_date = datetime.strptime(
            date,
            "%Y-%m-%d"
        ).date()

    except ValueError:

        return {
            "success": False,
            "error": "Invalid date. Use YYYY-MM-DD."
        }

    # Prevent past appointments
    today = datetime.now().date()

    if requested_date < today:

        return {
            "success": False,
            "error": (
                f"Cannot book an appointment in the past. "
                f"Today is {today.isoformat()}."
            )
        }

    doctor = get_doctor(doctor_id)

    if not doctor:

        return {
            "success": False,
            "error": "Doctor not found."
        }

    # Validate time
    allowed_slots = [
        "09:00",
        "10:30",
        "12:00",
        "15:00",
        "17:30",
        "18:30",
        "20:00"
    ]

    if time not in allowed_slots:

        return {
            "success": False,
            "error": f"Time {time} is not available."
        }

    appointment = create_appointment(
        doctor_id=doctor_id,
        date=date,
        time=time,
        patient_name=patient_name
    )

    return {
        "success": True,
        "appointment": appointment,
        "doctor": doctor
    }


# ============================================================
# VERIFY APPOINTMENT
# ============================================================

def verify_appointment(
    appointment_id: str
):

    appointment = get_appointment(
        appointment_id
    )

    if not appointment:

        return {
            "success": False,
            "verified": False,
            "error": "Appointment not found."
        }

    verified = (
        appointment["status"] == "confirmed"
    )

    return {
        "success": True,
        "verified": verified,
        "appointment": appointment
    }


# ============================================================
# REMINDER
# ============================================================

def schedule_reminder(
    appointment_id: str,
    minutes_before: int = 120
):

    appointment = get_appointment(
        appointment_id
    )

    if not appointment:

        return {
            "success": False,
            "error": "Appointment not found."
        }

    reminder = create_reminder(
        appointment_id,
        minutes_before
    )

    return {
        "success": True,
        "reminder": reminder
    }