import json
from datetime import datetime, timedelta
from openai import OpenAI

from app.config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OPENAI_BASE_URL
)

from app.tools.healthcare_tools import (
    search_doctors,
    check_availability,
    book_appointment,
    verify_appointment,
    schedule_reminder
)


client_kwargs = {
    "api_key": OPENAI_API_KEY
}

if OPENAI_BASE_URL:
    client_kwargs["base_url"] = OPENAI_BASE_URL

client = OpenAI(**client_kwargs)


# ============================================================
# TOOL DEFINITIONS
# ============================================================

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_doctors",
            "description": "Search for doctors by medical specialty and location.",
            "parameters": {
                "type": "object",
                "properties": {
                    "specialty": {
                        "type": "string",
                        "description": "Medical specialty such as Dermatologist, Cardiologist, General Physician."
                    },
                    "location": {
                        "type": "string",
                        "description": "City or location."
                    }
                },
                "required": ["specialty"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": "Check appointment availability for a doctor on a specific FUTURE date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {
                        "type": "string"
                    },
                    "date": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format."
                    }
                },
                "required": ["doctor_id", "date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_appointment",
            "description": "Book an appointment with a doctor on a specific FUTURE date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {
                        "type": "string"
                    },
                    "date": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format."
                    },
                    "time": {
                        "type": "string",
                        "description": "Appointment time in HH:MM 24-hour format."
                    },
                    "patient_name": {
                        "type": "string"
                    }
                },
                "required": [
                    "doctor_id",
                    "date",
                    "time"
                ]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "verify_appointment",
            "description": "Verify that a booked appointment exists and is confirmed.",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_id": {
                        "type": "string"
                    }
                },
                "required": ["appointment_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_reminder",
            "description": "Schedule a reminder before an appointment.",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_id": {
                        "type": "string"
                    },
                    "minutes_before": {
                        "type": "integer"
                    }
                },
                "required": ["appointment_id"]
            }
        }
    }
]


FUNCTIONS = {
    "search_doctors": search_doctors,
    "check_availability": check_availability,
    "book_appointment": book_appointment,
    "verify_appointment": verify_appointment,
    "schedule_reminder": schedule_reminder
}


# ============================================================
# DATE CONTEXT
# ============================================================

def get_date_context():
    today = datetime.now().date()

    tomorrow = today + timedelta(days=1)

    return {
        "today": today.isoformat(),
        "tomorrow": tomorrow.isoformat()
    }


# ============================================================
# SYSTEM PROMPT
# ============================================================

def build_system_prompt():

    dates = get_date_context()

    return f"""
You are MediAgent, an autonomous healthcare coordination agent.

CURRENT APPLICATION DATE:
Today = {dates["today"]}
Tomorrow = {dates["tomorrow"]}

CRITICAL DATE RULES:

1. The application date above is authoritative.
2. NEVER invent a date.
3. NEVER use dates from your training data.
4. NEVER use dates from previous examples.
5. NEVER book an appointment in the past.
6. When the user says "tomorrow", ALWAYS use:
   {dates["tomorrow"]}
7. When the user says "today", ALWAYS use:
   {dates["today"]}
8. When calling appointment tools, ALWAYS use YYYY-MM-DD.
9. If the user provides a specific date, use that date only if it
   is valid and not in the past.
10. If the user says "after 5 PM", only select slots at or after 17:00.
11. If the user says "evening", prefer 17:00-22:00.
12. Prefer the earliest suitable available slot.

YOUR RESPONSIBILITIES:

You are an autonomous healthcare coordination agent.

You can:

1. Understand the user's request.
2. Identify the appropriate medical specialty.
3. Search doctors.
4. Check availability.
5. Compare available doctors and slots.
6. Select the best suitable appointment.
7. Book the appointment.
8. Verify the appointment.
9. Schedule a reminder.

NORMAL WORKFLOW:

search_doctors
        ↓
check_availability
        ↓
compare results
        ↓
book_appointment
        ↓
verify_appointment
        ↓
schedule_reminder

Do not stop after searching.

If the user explicitly asks you to book an appointment,
complete the entire workflow.

SAFETY:

You are NOT a doctor.

Never:
- diagnose diseases
- prescribe medication
- claim certainty about medical conditions
- replace professional medical advice

If the user reports potentially life-threatening symptoms such as:
- severe chest pain
- severe difficulty breathing
- unconsciousness
- severe uncontrolled bleeding
- signs of stroke
- seizure
- severe allergic reaction

STOP normal appointment automation and advise the user to seek
immediate emergency medical care.

Do not attempt routine appointment booking for an apparent emergency.

PATIENT:

For demonstration purposes, use "Demo Patient" if no patient
name is supplied.

FINAL RESPONSE:

After completing the workflow, clearly summarize:
- doctor
- specialty
- hospital
- date
- time
- appointment ID
- verification status
- reminder status

Do not claim an appointment was booked unless the booking tool
actually succeeded and verification succeeded.
"""


# ============================================================
# AGENT
# ============================================================

def run_agent(user_message: str):

    system_prompt = build_system_prompt()

    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": user_message
        }
    ]

    activity = []

    # Prevent infinite tool loops
    MAX_ITERATIONS = 12

    for iteration in range(MAX_ITERATIONS):

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0
        )

        message = response.choices[0].message

        # ----------------------------------------------------
        # FINAL RESPONSE
        # ----------------------------------------------------

        if not message.tool_calls:

            return {
                "success": True,
                "response": message.content,
                "activity": activity
            }

        messages.append(message)

        # ----------------------------------------------------
        # TOOL EXECUTION
        # ----------------------------------------------------

        for tool_call in message.tool_calls:

            function_name = tool_call.function.name

            try:
                arguments = json.loads(
                    tool_call.function.arguments
                )
            except Exception:
                arguments = {}

            activity.append({
                "type": "tool_call",
                "tool": function_name,
                "arguments": arguments,
                "status": "running"
            })

            function = FUNCTIONS.get(function_name)

            if not function:

                result = {
                    "success": False,
                    "error": f"Unknown tool: {function_name}"
                }

            else:

                try:

                    # ------------------------------------------------
                    # HARD DATE SAFETY
                    # ------------------------------------------------

                    if function_name in [
                        "check_availability",
                        "book_appointment"
                    ]:

                        requested_date = arguments.get("date")

                        if requested_date:

                            try:

                                requested = datetime.strptime(
                                    requested_date,
                                    "%Y-%m-%d"
                                ).date()

                                today = datetime.now().date()

                                if requested < today:

                                    result = {
                                        "success": False,
                                        "error": (
                                            f"Date {requested_date} is in the past. "
                                            f"Today is {today.isoformat()}. "
                                            f"Use a future date."
                                        )
                                    }

                                else:

                                    result = function(**arguments)

                            except ValueError:

                                result = {
                                    "success": False,
                                    "error": (
                                        "Invalid date format. "
                                        "Use YYYY-MM-DD."
                                    )
                                }

                        else:

                            result = function(**arguments)

                    else:

                        result = function(**arguments)

                except Exception as e:

                    result = {
                        "success": False,
                        "error": str(e)
                    }

            # --------------------------------------------------------
            # UPDATE ACTIVITY
            # --------------------------------------------------------

            activity[-1]["status"] = (
                "completed"
                if result.get("success")
                else "failed"
            )

            activity[-1]["result"] = result

            # --------------------------------------------------------
            # RETURN TOOL RESULT TO MODEL
            # --------------------------------------------------------

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result)
            })

    # ------------------------------------------------------------
    # SAFETY FALLBACK
    # ------------------------------------------------------------

    return {
        "success": False,
        "response": (
            "I couldn't safely complete the requested workflow. "
            "Please try the request again."
        ),
        "activity": activity
    }