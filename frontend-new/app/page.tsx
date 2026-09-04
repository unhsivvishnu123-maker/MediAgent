"use client";

import { useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowUp,
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Home,
  Loader2,
  HeartPulse,
  Menu,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";


// ============================================================
// TYPES
// ============================================================

type ActivityItem = {
  type: string;
  tool: string;
  arguments: Record<string, any>;
  status: string;
  result?: any;
};


type AgentResponse = {
  success: boolean;
  response: string;
  activity: ActivityItem[];
};


// ============================================================
// TOOL DISPLAY CONFIG
// ============================================================

const TOOL_LABELS: Record<string, string> = {
  search_doctors: "Searching doctors",
  check_availability: "Checking availability",
  book_appointment: "Booking appointment",
  verify_appointment: "Verifying appointment",
  schedule_reminder: "Scheduling reminder",
};


const TOOL_ICONS: Record<string, any> = {
  search_doctors: Search,
  check_availability: CalendarDays,
  book_appointment: Stethoscope,
  verify_appointment: ShieldCheck,
  schedule_reminder: Bell,
};


// ============================================================
// MAIN PAGE
// ============================================================

export default function HomePage() {

  // ----------------------------------------------------------
  // MESSAGE STATE
  // ----------------------------------------------------------

  // Current text inside input box
  const [message, setMessage] = useState("");

  // Last message actually submitted to the AI
  const [submittedMessage, setSubmittedMessage] = useState("");

  // Agent response
  const [agentData, setAgentData] =
    useState<AgentResponse | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Mobile menu
  const [mobileMenu, setMobileMenu] = useState(false);


  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  async function sendMessage() {

    const currentMessage = message.trim();

    // Don't send empty messages
    if (!currentMessage || loading) {
      return;
    }


    // --------------------------------------------------------
    // SAVE SUBMITTED MESSAGE
    // --------------------------------------------------------

    setSubmittedMessage(currentMessage);


    // --------------------------------------------------------
    // CLEAR INPUT IMMEDIATELY
    // --------------------------------------------------------

    setMessage("");


    // --------------------------------------------------------
    // START LOADING
    // --------------------------------------------------------

    setLoading(true);

    setAgentData(null);


    try {

      // ------------------------------------------------------
      // CALL FASTAPI BACKEND
      // ------------------------------------------------------

      const response = await fetch(
        "http://127.0.0.1:8000/api/agent",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: currentMessage,
          }),
        }
      );


      // ------------------------------------------------------
      // CHECK HTTP RESPONSE
      // ------------------------------------------------------

      if (!response.ok) {

        throw new Error(
          `Backend returned ${response.status}`
        );

      }


      // ------------------------------------------------------
      // PARSE RESPONSE
      // ------------------------------------------------------

      const data: AgentResponse =
        await response.json();


      // ------------------------------------------------------
      // SAVE AGENT RESPONSE
      // ------------------------------------------------------

      setAgentData(data);


    } catch (error) {

      console.error(
        "MediAgent connection error:",
        error
      );


      // ------------------------------------------------------
      // SHOW FRIENDLY ERROR
      // ------------------------------------------------------

      setAgentData({

        success: false,

        response:
          "I couldn't connect to the MediAgent backend. Please make sure the FastAPI server is running on port 8000.",

        activity: [],

      });


    } finally {

      setLoading(false);

    }

  }


  // ==========================================================
  // EXAMPLE PROMPT
  // ==========================================================

  function useExample(text: string) {

    setMessage(text);

  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">


      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">

        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 lg:px-8">


          {/* BRAND */}

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">

              <HeartPulse size={21} />

            </div>


            <div>

              <div className="text-[17px] font-bold tracking-tight">
                MediAgent
              </div>

              <div className="hidden text-[11px] text-slate-500 sm:block">
                Autonomous Healthcare Coordination
              </div>

            </div>

          </div>


          {/* DESKTOP HEADER */}

          <div className="hidden items-center gap-2 md:flex">


            {/* STATUS */}

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">

              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

              AI Agent Online

            </div>


            {/* NOTIFICATION */}

            <button
              className="ml-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >

              <Bell size={19} />

            </button>


            {/* PROFILE */}

            <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">

              DP

            </div>

          </div>


          {/* MOBILE MENU */}

          <button
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
            className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >

            {mobileMenu ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}

          </button>

        </div>


        {/* MOBILE NAV */}

        {mobileMenu && (

          <div className="border-t border-slate-100 bg-white p-4 md:hidden">

            <div className="space-y-1">

              <MobileNavItem
                icon={<Home size={17} />}
                label="Dashboard"
              />

              <MobileNavItem
                icon={<MessageCircle size={17} />}
                label="AI Assistant"
              />

              <MobileNavItem
                icon={<CalendarDays size={17} />}
                label="Appointments"
              />

              <MobileNavItem
                icon={<Stethoscope size={17} />}
                label="Doctors"
              />

              <MobileNavItem
                icon={<Bell size={17} />}
                label="Reminders"
              />

              <MobileNavItem
                icon={<Settings size={17} />}
                label="Settings"
              />

            </div>

          </div>

        )}

      </header>


      {/* ====================================================
          MAIN LAYOUT
      ==================================================== */}

      <div className="mx-auto flex max-w-[1500px]">


        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="hidden min-h-[calc(100vh-64px)] w-60 border-r border-slate-200 bg-white p-4 md:block">


          <nav className="space-y-1">

            <NavItem
              icon={<Home size={18} />}
              label="Dashboard"
              active
            />

            <NavItem
              icon={<MessageCircle size={18} />}
              label="AI Assistant"
            />

            <NavItem
              icon={<CalendarDays size={18} />}
              label="Appointments"
            />

            <NavItem
              icon={<Stethoscope size={18} />}
              label="Doctors"
            />

            <NavItem
              icon={<Bell size={18} />}
              label="Reminders"
            />

          </nav>


          {/* SYSTEM */}

          <div className="mt-8 border-t border-slate-100 pt-5">

            <div className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              System
            </div>

            <NavItem
              icon={<Settings size={18} />}
              label="Settings"
            />

          </div>


          {/* PRIVACY CARD */}

          <div className="mt-8 rounded-2xl bg-slate-50 p-4">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">

              <ShieldCheck size={18} />

            </div>


            <div className="text-xs font-semibold">
              Privacy-first
            </div>


            <p className="mt-1 text-[11px] leading-5 text-slate-500">

              Your healthcare coordination data is handled securely.

            </p>

          </div>

        </aside>


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <section className="min-w-0 flex-1 p-5 lg:p-8">

          <div className="mx-auto max-w-6xl">


            {/* =================================================
                WELCOME
            ================================================= */}

            <div className="mb-7">


              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">

                <Sparkles size={14} />

                AI-powered healthcare coordination

              </div>


              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">

                Good evening, Demo Patient.

              </h1>


              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">

                Tell MediAgent what you need. Your AI agent can plan,
                coordinate and execute multi-step healthcare tasks for you.

              </p>

            </div>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">


              <StatCard
                icon={<CalendarDays size={18} />}
                title="Upcoming"
                value={
                  agentData?.success &&
                  agentData.activity.length > 0
                    ? "1 appointment"
                    : "No appointments"
                }
              />


              <StatCard
                icon={<Bell size={18} />}
                title="Reminders"
                value={
                  agentData?.success &&
                  agentData.activity.length > 0
                    ? "1 scheduled"
                    : "0 active"
                }
              />


              <StatCard
                icon={<Activity size={18} />}
                title="Agent status"
                value={
                  loading
                    ? "Executing"
                    : "Ready"
                }
              />

            </div>


            {/* =================================================
                CHAT + AGENT
            ================================================= */}

            <div className="grid gap-5 lg:grid-cols-[1fr_390px]">


              {/* =================================================
                  CHAT
              ================================================= */}

              <div className="flex min-h-[570px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                {/* CHAT HEADER */}

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                  <div className="flex items-center gap-3">


                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">

                      <Bot size={18} />

                    </div>


                    <div>

                      <div className="text-sm font-semibold">

                        MediAgent Assistant

                      </div>


                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                        {loading
                          ? "Executing task"
                          : "Ready to execute"}

                      </div>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    CHAT CONTENT
                ================================================= */}

                <div className="flex-1 overflow-y-auto p-5">


                  {/* EMPTY STATE */}

                  {!agentData && !loading && (

                    <div className="flex h-full flex-col items-center justify-center text-center">


                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                        <HeartPulse size={30} />

                      </div>


                      <h2 className="text-lg font-semibold">

                        How can I help you today?

                      </h2>


                      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">

                        Ask me to find a doctor, check availability,
                        book an appointment, or coordinate follow-up tasks.

                      </p>


                      {/* EXAMPLES */}

                      <div className="mt-7 grid w-full max-w-lg gap-2 sm:grid-cols-2">


                        <ExampleButton
                          text="Find a dermatologist tomorrow after 5 PM"
                          onClick={() =>
                            useExample(
                              "I have had a skin rash for 3 days. Find me a dermatologist tomorrow after 5 PM, choose the earliest available appointment, book it, verify it, and remind me 2 hours before."
                            )
                          }
                        />


                        <ExampleButton
                          text="Find a general physician"
                          onClick={() =>
                            useExample(
                              "Find me a general physician tomorrow evening and book the earliest available appointment."
                            )
                          }
                        />

                      </div>

                    </div>

                  )}


                  {/* =================================================
                      LOADING
                  ================================================= */}

                  {loading && (

                    <div className="space-y-5">


                      {/* USER MESSAGE */}

                      {submittedMessage && (

                        <div className="flex items-start gap-3">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">

                            <UserRound size={15} />

                          </div>


                          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm leading-6">

                            {submittedMessage}

                          </div>

                        </div>

                      )}


                      {/* AI LOADING */}

                      <div className="flex items-start gap-3">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">

                          <Bot size={16} />

                        </div>


                        <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <Loader2
                              size={15}
                              className="animate-spin"
                            />

                            MediAgent is executing your request...

                          </div>

                        </div>

                      </div>

                    </div>

                  )}


                  {/* =================================================
                      RESPONSE
                  ================================================= */}

                  {agentData && !loading && (

                    <div className="space-y-5">


                      {/* USER MESSAGE */}

                      {submittedMessage && (

                        <div className="flex items-start gap-3">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">

                            <UserRound size={15} />

                          </div>


                          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm leading-6">

                            {submittedMessage}

                          </div>

                        </div>

                      )}


                      {/* AI MESSAGE */}

                      <div className="flex items-start gap-3">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">

                          <Bot size={16} />

                        </div>


                        <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-4 text-sm leading-7 shadow-sm">

                          <div className="whitespace-pre-wrap">

                            {agentData.response}

                          </div>

                        </div>

                      </div>


                      {/* SUCCESS */}

                      {agentData.success &&
                        agentData.activity.length > 0 && (

                          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">

                            <CheckCircle2 size={16} />

                            Autonomous task completed successfully.

                          </div>

                        )}

                    </div>

                  )}

                </div>


                {/* =================================================
                    INPUT
                ================================================= */}

                <div className="border-t border-slate-100 p-4">


                  <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-slate-400 focus-within:bg-white">


                    <textarea
                      value={message}
                      onChange={(e) =>
                        setMessage(e.target.value)
                      }
                      onKeyDown={(e) => {

                        if (
                          e.key === "Enter" &&
                          !e.shiftKey
                        ) {

                          e.preventDefault();

                          sendMessage();

                        }

                      }}
                      placeholder="Tell MediAgent what you need..."
                      rows={2}
                      disabled={loading}
                      className="max-h-32 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                    />


                    <button
                      onClick={sendMessage}
                      disabled={
                        !message.trim() ||
                        loading
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Send message"
                    >

                      {loading ? (

                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                      ) : (

                        <ArrowUp size={18} />

                      )}

                    </button>

                  </div>


                  <div className="mt-2 flex items-center justify-between px-1">

                    <div className="text-[10px] text-slate-400">

                      MediAgent can coordinate care, not diagnose.

                    </div>


                    <div className="hidden text-[10px] text-slate-400 sm:block">

                      Enter to send · Shift + Enter for newline

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  AGENT EXECUTION PANEL
              ================================================= */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                {/* HEADER */}

                <div className="border-b border-slate-100 px-5 py-4">

                  <div className="flex items-center justify-between">


                    <div>

                      <div className="flex items-center gap-2 text-sm font-semibold">

                        <Activity size={17} />

                        Agent Execution

                      </div>


                      <p className="mt-1 text-[11px] text-slate-500">

                        Real-time autonomous workflow

                      </p>

                    </div>


                    {loading && (

                      <Loader2
                        size={17}
                        className="animate-spin text-slate-500"
                      />

                    )}

                  </div>

                </div>


                {/* BODY */}

                <div className="p-5">


                  {/* EMPTY */}

                  {!agentData && !loading && (

                    <div className="flex min-h-[460px] flex-col items-center justify-center text-center">


                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">

                        <Activity size={22} />

                      </div>


                      <div className="text-sm font-semibold">

                        Agent is ready

                      </div>


                      <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">

                        When you submit a task, you'll see every tool
                        the AI uses to complete it.

                      </p>

                    </div>

                  )}


                  {/* LOADING */}

                  {loading && (

                    <div className="space-y-5">

                      <ExecutionSkeleton
                        text="Understanding request"
                      />

                      <ExecutionSkeleton
                        text="Planning workflow"
                      />

                      <ExecutionSkeleton
                        text="Selecting tools"
                      />

                      <ExecutionSkeleton
                        text="Executing actions"
                      />

                    </div>

                  )}


                  {/* RESULTS */}

                  {agentData && !loading && (

                    <div>


                      {/* ONLY SHOW IF TOOLS WERE USED */}

                      {agentData.activity.length > 0 && (

                        <div className="mb-5 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white">

                          <Sparkles size={15} />

                          Autonomous workflow executed

                        </div>

                      )}


                      {/* TOOL TIMELINE */}

                      {agentData.activity.length > 0 ? (

                        <div className="space-y-1">

                          {agentData.activity.map(
                            (item, index) => {

                              const Icon =
                                TOOL_ICONS[item.tool] ||
                                Activity;


                              return (

                                <div
                                  key={`${item.tool}-${index}`}
                                  className="relative flex gap-3 py-3"
                                >


                                  {/* CONNECTOR */}

                                  {index <
                                    agentData.activity.length - 1 && (

                                    <div className="absolute left-[15px] top-9 h-full w-px bg-slate-200" />

                                  )}


                                  {/* STATUS ICON */}

                                  <div
                                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                      item.status ===
                                      "completed"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-red-50 text-red-600"
                                    }`}
                                  >

                                    {item.status ===
                                    "completed" ? (

                                      <CheckCircle2 size={16} />

                                    ) : (

                                      <X size={16} />

                                    )}

                                  </div>


                                  {/* TOOL INFO */}

                                  <div className="min-w-0 flex-1">


                                    <div className="flex items-center justify-between">

                                      <div className="text-xs font-semibold">

                                        {TOOL_LABELS[
                                          item.tool
                                        ] ||
                                          item.tool}

                                      </div>


                                      <ChevronRight
                                        size={14}
                                        className="text-slate-300"
                                      />

                                    </div>


                                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">

                                      <Icon size={11} />

                                      {item.tool}

                                    </div>

                                  </div>

                                </div>

                              );

                            }
                          )}

                        </div>

                      ) : (

                        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">


                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">

                            <MessageCircle size={21} />

                          </div>


                          <div className="text-sm font-semibold">

                            Conversation completed

                          </div>


                          <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">

                            No external tools were required for this response.

                          </p>

                        </div>

                      )}


                      {/* TASK COMPLETED */}

                      {agentData.success &&
                        agentData.activity.length > 0 && (

                          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">


                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">

                              <CheckCircle2 size={15} />

                              Task completed

                            </div>


                            <p className="mt-1 text-[11px] leading-5 text-emerald-700/80">

                              The agent planned and executed{" "}

                              {agentData.activity.length}{" "}

                              actions autonomously.

                            </p>

                          </div>

                        )}

                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* =================================================
                SAFETY NOTICE
            ================================================= */}

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">


              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-amber-600"
              />


              <div>


                <div className="text-xs font-semibold text-amber-800">

                  Healthcare safety notice

                </div>


                <p className="mt-1 text-[11px] leading-5 text-amber-800/80">

                  MediAgent is designed for healthcare coordination
                  and appointment assistance. It does not provide
                  medical diagnosis or emergency treatment. If you
                  believe you are experiencing an emergency, seek
                  immediate professional medical care.

                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>

  );
}


// ============================================================
// SIDEBAR NAV ITEM
// ============================================================

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {

  return (

    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-slate-900 font-medium text-white"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >

      {icon}

      {label}

    </button>

  );

}


// ============================================================
// MOBILE NAV ITEM
// ============================================================

function MobileNavItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {

  return (

    <button
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
    >

      {icon}

      {label}

    </button>

  );

}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {

  return (

    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">


      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

        {icon}

      </div>


      <div>

        <div className="text-[10px] uppercase tracking-wider text-slate-400">

          {title}

        </div>


        <div className="mt-0.5 text-sm font-semibold">

          {value}

        </div>

      </div>

    </div>

  );

}


// ============================================================
// EXAMPLE BUTTON
// ============================================================

function ExampleButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {

  return (

    <button
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white p-3 text-left text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
    >

      <div className="flex items-center justify-between gap-2">

        <span>{text}</span>

        <ChevronRight
          size={14}
          className="shrink-0 text-slate-300"
        />

      </div>

    </button>

  );

}


// ============================================================
// EXECUTION SKELETON
// ============================================================

function ExecutionSkeleton({
  text,
}: {
  text: string;
}) {

  return (

    <div className="flex items-center gap-3">


      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">

        <Loader2
          size={15}
          className="animate-spin text-slate-400"
        />

      </div>


      <div className="text-xs text-slate-500">

        {text}...

      </div>

    </div>

  );

}