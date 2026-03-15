"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import AurosBackground from "../../components/AurosBackground";
import AurosTopbar from "../../components/AurosTopbar";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "transparent",
  color: "white",
  padding: "32px 20px 60px",
  position: "relative",
  zIndex: 1,
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
};

const glassCardStyle: React.CSSProperties = {
  background: "rgba(15, 27, 52, 0.74)",
  border: "1px solid rgba(34, 48, 77, 0.95)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const panelStyle: React.CSSProperties = {
  background: "rgba(11, 21, 43, 0.88)",
  border: "1px solid #22304d",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.92)",
  color: "white",
  outline: "none",
  fontSize: "15px",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#dbe7ff",
  marginBottom: "8px",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(76, 201, 240, 0.18)",
};

const successButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const ghostButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid #22304d",
  background: "rgba(11, 21, 43, 0.9)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "1px solid #5b2333",
  background: "#1d1220",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(76, 201, 240, 0.18)",
  background: "rgba(76, 201, 240, 0.10)",
  color: "#95ecff",
  fontSize: "13px",
  fontWeight: 700,
};

const emptyJobForm = {
  title: "",
  department: "",
  type: "",
  location: "",
  description: "",
  requirements: "",
  role_category: "Other",
};

function statusPillStyle(status: string | null): React.CSSProperties {
  if (status === "Accepted") {
    return {
      ...pillStyle,
      background: "rgba(34, 197, 94, 0.12)",
      color: "#9ef1b5",
      border: "1px solid rgba(34, 197, 94, 0.16)",
    };
  }

  if (status === "Rejected") {
    return {
      ...pillStyle,
      background: "rgba(239, 68, 68, 0.12)",
      color: "#ffb0b0",
      border: "1px solid rgba(239, 68, 68, 0.16)",
    };
  }

  return {
    ...pillStyle,
    background: "rgba(76, 201, 240, 0.12)",
    color: "#aaf3ff",
    border: "1px solid rgba(76, 201, 240, 0.18)",
  };
}

function reviewLabelStyle(label: string | null): React.CSSProperties {
  if (label === "interessant") {
    return {
      ...pillStyle,
      background: "rgba(76, 201, 240, 0.12)",
      color: "#aaf3ff",
      border: "1px solid rgba(76, 201, 240, 0.18)",
    };
  }

  if (label === "später") {
    return {
      ...pillStyle,
      background: "rgba(245, 158, 11, 0.12)",
      color: "#ffd58f",
      border: "1px solid rgba(245, 158, 11, 0.18)",
    };
  }

  if (label === "abgelehnt") {
    return {
      ...pillStyle,
      background: "rgba(239, 68, 68, 0.12)",
      color: "#ffb0b0",
      border: "1px solid rgba(239, 68, 68, 0.16)",
    };
  }

  return pillStyle;
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [patchnotes, setPatchnotes] = useState<any[]>([]);

  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [expandedApplications, setExpandedApplications] = useState<string[]>([]);
  const [expandedPatchnotes, setExpandedPatchnotes] = useState<string[]>([]);

  const [patchVersion, setPatchVersion] = useState("");
  const [patchTitle, setPatchTitle] = useState("");
  const [patchContent, setPatchContent] = useState("");
  const [editingPatchId, setEditingPatchId] = useState<string | null>(null);

  async function loadApplications() {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        name,
        discord,
        discord_name,
        age,
        email,
        timezone,
        experience,
        motivation,
        availability,
        developer_skills,
        developer_projects,
        support_cases,
        support_communication,
        competitive_knowledge,
        competitive_plans,
        manager_leadership,
        manager_organization,
        director_vision,
        director_responsibility,
        other_strengths,
        tracking_code,
        status,
        notes,
        rating,
        review_label,
        created_at,
        jobs (
          title,
          role_category
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setApplications(data ?? []);
  }

  async function loadJobs() {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setJobs(data ?? []);
  }

  async function loadPatchnotes() {
    const { data, error } = await supabase
      .from("patchnotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setPatchnotes(data ?? []);
  }

  async function checkUser() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserEmail(null);
      setIsAdmin(false);
      setApplications([]);
      setJobs([]);
      setPatchnotes([]);
      setLoading(false);
      return;
    }

    setUserEmail(user.email ?? null);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      setIsAdmin(false);
      setApplications([]);
      setJobs([]);
      setPatchnotes([]);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    await Promise.all([loadApplications(), loadJobs(), loadPatchnotes()]);
    setLoading(false);
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setEmail("");
    setPassword("");
    await checkUser();
  }

  async function logout() {
    await supabase.auth.signOut();
    await checkUser();
  }

  async function updateApplicationStatus(id: string, status: string) {
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadApplications();
  }

  async function updateApplicationNotes(id: string, notes: string) {
    const { error } = await supabase
      .from("applications")
      .update({ notes })
      .eq("id", id);

    if (error) {
      alert("Notes could not be saved.");
      console.log(error);
      return;
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, notes } : app))
    );
  }

  async function updateApplicationRating(id: string, rating: number) {
    const { error } = await supabase
      .from("applications")
      .update({ rating })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, rating } : app))
    );
  }

  async function updateApplicationReviewLabel(id: string, review_label: string) {
    const { error } = await supabase
      .from("applications")
      .update({ review_label })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, review_label } : app))
    );
  }

  async function deleteApplication(id: string) {
    const confirmed = window.confirm(
      "Do you really want to delete this application?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setExpandedApplications((prev) => prev.filter((item) => item !== id));
    await loadApplications();
  }

  async function saveJob() {
    if (!jobForm.title || !jobForm.department || !jobForm.description) {
      alert("Please fill in title, department, and description.");
      return;
    }

    const requirementsArray = jobForm.requirements
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: jobForm.title,
      department: jobForm.department,
      type: jobForm.type || "Volunteer",
      location: jobForm.location || "Remote",
      description: jobForm.description,
      requirements: requirementsArray,
      role_category: jobForm.role_category || "Other",
    };

    if (editingJobId) {
      const { error } = await supabase
        .from("jobs")
        .update(payload)
        .eq("id", editingJobId);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("jobs").insert({
        ...payload,
        status: "Open",
      });

      if (error) {
        alert(error.message);
        return;
      }

      try {
        await fetch("/api/job-notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (notifyError) {
        console.log("Job Discord notify failed:", notifyError);
      }
    }

    setJobForm(emptyJobForm);
    setEditingJobId(null);
    await loadJobs();
  }

  function startEditJob(job: any) {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || "",
      department: job.department || "",
      type: job.type || "",
      location: job.location || "",
      description: job.description || "",
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join(", ")
        : "",
      role_category: job.role_category || "Other",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditJob() {
    setEditingJobId(null);
    setJobForm(emptyJobForm);
  }

async function updateJobStatus(id: string, status: string) {
  const job = jobs.find((item) => item.id === id);

  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  if (job && (status === "Filled" || status === "Open")) {
    try {
      await fetch("/api/job-status-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: job.title,
          department: job.department,
          location: job.location,
          role_category: job.role_category,
          status,
        }),
      });
    } catch (notifyError) {
      console.log("Job status notify failed:", notifyError);
    }
  }

  await loadJobs();
}

  async function deleteJob(id: string) {
    const confirmed = window.confirm("Do you really want to delete this job?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    if (editingJobId === id) {
      cancelEditJob();
    }

    await loadJobs();
  }

  async function savePatchnote() {
    if (!patchVersion || !patchTitle || !patchContent) {
      alert("Please fill in version, title, and content.");
      return;
    }

    if (editingPatchId) {
      const { error } = await supabase
        .from("patchnotes")
        .update({
          version: patchVersion,
          title: patchTitle,
          content: patchContent,
        })
        .eq("id", editingPatchId);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("patchnotes").insert({
        version: patchVersion,
        title: patchTitle,
        content: patchContent,
      });

      if (error) {
        alert(error.message);
        return;
      }
    }

    setPatchVersion("");
    setPatchTitle("");
    setPatchContent("");
    setEditingPatchId(null);
    await loadPatchnotes();
  }

  function startEditPatchnote(note: any) {
    setEditingPatchId(note.id);
    setPatchVersion(note.version || "");
    setPatchTitle(note.title || "");
    setPatchContent(note.content || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditPatchnote() {
    setEditingPatchId(null);
    setPatchVersion("");
    setPatchTitle("");
    setPatchContent("");
  }

  async function deletePatchnote(id: string) {
    const confirmed = window.confirm(
      "Do you really want to delete this patchnote?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("patchnotes")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    if (editingPatchId === id) {
      cancelEditPatchnote();
    }

    setExpandedPatchnotes((prev) => prev.filter((item) => item !== id));
    await loadPatchnotes();
  }

  function toggleApplication(id: string) {
    setExpandedApplications((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function togglePatchnote(id: string) {
    setExpandedPatchnotes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesName = (app.name || "")
        .toLowerCase()
        .includes(searchName.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || app.status === statusFilter;

      const matchesRole =
        roleFilter === "All" || app.jobs?.title === roleFilter;

      return matchesName && matchesStatus && matchesRole;
    });
  }, [applications, searchName, statusFilter, roleFilter]);

  const roleOptions = useMemo(() => {
    return Array.from(
      new Set(applications.map((app) => app.jobs?.title).filter(Boolean))
    );
  }, [applications]);

  useEffect(() => {
    checkUser();
  }, []);

  if (loading) {
    return (
      <>
        <AurosBackground />
        <main style={pageStyle}>
          <div style={{ ...containerStyle, maxWidth: "900px" }}>
            <AurosTopbar current="admin" />
            <div
              style={{
                minHeight: "50vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={glassCardStyle}>Loading admin dashboard...</div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!userEmail) {
    return (
      <>
        <AurosBackground />
        <main style={pageStyle}>
          <div style={{ ...containerStyle, maxWidth: 520 }}>
            <AurosTopbar current="admin" />

            <section style={{ ...glassCardStyle, padding: "34px" }}>
              <p
                style={{
                  color: "#4cc9f0",
                  fontWeight: 800,
                  marginBottom: 10,
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                }}
              >
                AUROS ADMIN
              </p>

              <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: "40px" }}>
                Admin Login
              </h1>

              <p
                style={{
                  color: "#9fb0d0",
                  marginBottom: 24,
                  lineHeight: 1.7,
                }}
              >
                Sign in to access applications, jobs, internal notes, and
                patchnotes.
              </p>

              <div style={{ display: "grid", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Admin Email</label>
                  <input
                    placeholder="Admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <button onClick={login} style={primaryButtonStyle}>
                  Login
                </button>
              </div>
            </section>
          </div>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <AurosBackground />
        <main style={pageStyle}>
          <div style={{ ...containerStyle, maxWidth: 560 }}>
            <AurosTopbar current="admin" />

            <section style={glassCardStyle}>
              <h1>No admin access</h1>
              <p style={{ color: "#9fb0d0" }}>Logged in as: {userEmail}</p>
              <button onClick={logout} style={ghostButtonStyle}>
                Logout
              </button>
            </section>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AurosBackground />

      <main style={pageStyle}>
        <div style={containerStyle}>
          <AurosTopbar current="admin" />

          <style jsx>{`
            .statsGrid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 18px;
            }

            .splitGrid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 22px;
              align-items: start;
            }

            .patchGrid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 22px;
              align-items: start;
            }

            .filtersGrid {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr 0.8fr;
              gap: 12px;
              margin-bottom: 20px;
            }

            .applicationGrid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 18px;
              align-items: start;
            }

            .miniGrid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
            }

            @media (max-width: 980px) {
              .statsGrid,
              .splitGrid,
              .patchGrid,
              .filtersGrid,
              .applicationGrid,
              .miniGrid {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 640px) {
              .appHeaderRow,
              .jobHeaderRow,
              .patchHeaderRow {
                flex-direction: column;
                align-items: flex-start !important;
              }
            }
          `}</style>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              marginBottom: 22,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  color: "#4cc9f0",
                  fontWeight: 800,
                  marginBottom: 8,
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                }}
              >
                AUROS ADMIN DASHBOARD
              </p>
              <h1 style={{ margin: 0, fontSize: "44px", lineHeight: 1.05 }}>
                Staff Management
              </h1>
              <p style={{ color: "#9fb0d0", marginTop: 8 }}>
                Logged in as: {userEmail}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={pillStyle}>{jobs.length} Jobs</span>
              <span style={pillStyle}>{applications.length} Applications</span>
              <span style={pillStyle}>{patchnotes.length} Patchnotes</span>
              <button onClick={logout} style={ghostButtonStyle}>
                Logout
              </button>
            </div>
          </div>

          <section
            style={{ ...glassCardStyle, padding: "30px", marginBottom: 22 }}
          >
            <div className="statsGrid">
              <div style={panelStyle}>
                <p style={{ margin: 0, color: "#9fb0d0" }}>Applications</p>
                <h3 style={{ margin: "10px 0 0 0", fontSize: "32px" }}>
                  {applications.length}
                </h3>
              </div>

              <div style={panelStyle}>
                <p style={{ margin: 0, color: "#9fb0d0" }}>Open Jobs</p>
                <h3 style={{ margin: "10px 0 0 0", fontSize: "32px" }}>
                  {jobs.filter((job) => job.status === "Open").length}
                </h3>
              </div>

              <div style={panelStyle}>
                <p style={{ margin: 0, color: "#9fb0d0" }}>Patchnotes</p>
                <h3 style={{ margin: "10px 0 0 0", fontSize: "32px" }}>
                  {patchnotes.length}
                </h3>
              </div>
            </div>
          </section>

          <div className="splitGrid">
            <section style={glassCardStyle}>
              <h2 style={{ marginTop: 0 }}>
                {editingJobId ? "Edit Job" : "Create Job"}
              </h2>

              <div style={{ display: "grid", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Job Title</label>
                  <input
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Department</label>
                  <input
                    value={jobForm.department}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Role Category</label>
                  <select
                    value={jobForm.role_category}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        role_category: e.target.value,
                      }))
                    }
                    style={inputStyle}
                  >
                    <option style={{ background: "#0b152b" }} value="Developer">
                      Developer
                    </option>
                    <option style={{ background: "#0b152b" }} value="Supporter">
                      Supporter
                    </option>
                    <option
                      style={{ background: "#0b152b" }}
                      value="Competitive Manager"
                    >
                      Competitive Manager
                    </option>
                    <option style={{ background: "#0b152b" }} value="Manager">
                      Manager
                    </option>
                    <option style={{ background: "#0b152b" }} value="Director">
                      Director
                    </option>
                    <option style={{ background: "#0b152b" }} value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="miniGrid">
                  <div>
                    <label style={labelStyle}>Type</label>
                    <input
                      value={jobForm.type}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Location</label>
                    <input
                      value={jobForm.location}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    style={textareaStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Requirements</label>
                  <input
                    value={jobForm.requirements}
                    onChange={(e) =>
                      setJobForm((prev) => ({
                        ...prev,
                        requirements: e.target.value,
                      }))
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={saveJob} style={primaryButtonStyle}>
                    {editingJobId ? "Save Changes" : "Create Job"}
                  </button>

                  {editingJobId && (
                    <button onClick={cancelEditJob} style={ghostButtonStyle}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section style={glassCardStyle}>
              <h2 style={{ marginTop: 0 }}>Job Listings</h2>

              <div style={{ display: "grid", gap: "14px" }}>
                {jobs.map((job) => (
                  <div key={job.id} style={panelStyle}>
                    <div
                      className="jobHeaderRow"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "start",
                        flexWrap: "wrap",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <h3 style={{ marginTop: 0, marginBottom: 8 }}>
                          {job.title || "No title"}
                        </h3>
                        <p style={{ color: "#9fb0d0", margin: "4px 0" }}>
                          {job.department || "-"} • {job.type || "-"} •{" "}
                          {job.location || "-"}
                        </p>
                        <p style={{ color: "#9fb0d0", margin: "4px 0" }}>
                          Category: {job.role_category || "Other"}
                        </p>
                      </div>

                      <span style={pillStyle}>{job.status || "-"}</span>
                    </div>

                    <p style={{ color: "#dbe7ff", lineHeight: 1.6 }}>
                      {job.description || "-"}
                    </p>

                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      <button
                        onClick={() => startEditJob(job)}
                        style={ghostButtonStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => updateJobStatus(job.id, "Open")}
                        style={primaryButtonStyle}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => updateJobStatus(job.id, "Filled")}
                        style={ghostButtonStyle}
                      >
                        Filled
                      </button>
                      <button
                        onClick={() => deleteJob(job.id)}
                        style={dangerButtonStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section style={{ ...glassCardStyle, marginTop: 22 }}>
            <div className="patchGrid">
              <div>
                <h2 style={{ marginTop: 0 }}>
                  {editingPatchId ? "Edit Patchnote" : "Create Patchnote"}
                </h2>

                <div style={{ display: "grid", gap: "14px" }}>
                  <div>
                    <label style={labelStyle}>Version</label>
                    <input
                      value={patchVersion}
                      onChange={(e) => setPatchVersion(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Title</label>
                    <input
                      value={patchTitle}
                      onChange={(e) => setPatchTitle(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Content</label>
                    <textarea
                      value={patchContent}
                      onChange={(e) => setPatchContent(e.target.value)}
                      style={{ ...textareaStyle, minHeight: 180 }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={savePatchnote} style={primaryButtonStyle}>
                      {editingPatchId ? "Save Patchnote" : "Create Patchnote"}
                    </button>

                    {editingPatchId && (
                      <button
                        onClick={cancelEditPatchnote}
                        style={ghostButtonStyle}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{ marginTop: 0 }}>Patchnote Entries</h2>

                <div style={{ display: "grid", gap: "14px" }}>
                  {patchnotes.map((note) => {
                    const isOpen = expandedPatchnotes.includes(note.id);

                    return (
                      <div key={note.id} style={panelStyle}>
                        <div
                          className="patchHeaderRow"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <h3 style={{ margin: 0 }}>
                              {note.version || "No Version"} —{" "}
                              {note.title || "No Title"}
                            </h3>
                            <p
                              style={{ margin: "8px 0 0 0", color: "#9fb0d0" }}
                            >
                              {note.created_at
                                ? new Date(note.created_at).toLocaleDateString()
                                : "-"}
                            </p>
                          </div>

                          <div
                            style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                          >
                            <button
                              onClick={() => togglePatchnote(note.id)}
                              style={ghostButtonStyle}
                            >
                              {isOpen ? "Hide Details" : "Show Details"}
                            </button>
                            <button
                              onClick={() => startEditPatchnote(note)}
                              style={ghostButtonStyle}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deletePatchnote(note.id)}
                              style={dangerButtonStyle}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div
                            style={{
                              color: "#dbe7ff",
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.7,
                              marginTop: 14,
                              padding: "14px",
                              borderRadius: "14px",
                              background: "#081225",
                              border: "1px solid #22304d",
                            }}
                          >
                            {note.content || "-"}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {patchnotes.length === 0 && (
                    <div style={{ ...panelStyle, color: "#9fb0d0" }}>
                      No patchnotes created yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section style={{ ...glassCardStyle, marginTop: 22 }}>
            <div className="filtersGrid">
              <input
                placeholder="Search by applicant name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={inputStyle}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={inputStyle}
              >
                <option style={{ background: "#0b152b" }} value="All">
                  All Statuses
                </option>
                <option style={{ background: "#0b152b" }} value="New">
                  New
                </option>
                <option style={{ background: "#0b152b" }} value="Accepted">
                  Accepted
                </option>
                <option style={{ background: "#0b152b" }} value="Rejected">
                  Rejected
                </option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={inputStyle}
              >
                <option style={{ background: "#0b152b" }} value="All">
                  All Roles
                </option>
                {roleOptions.map((role) => (
                  <option
                    key={role}
                    style={{ background: "#0b152b" }}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {filteredApplications.map((app) => {
                const isOpen = expandedApplications.includes(app.id);

                return (
                  <div key={app.id} style={panelStyle}>
                    <div
                      className="appHeaderRow"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: "0 0 8px 0" }}>
                          {app.name || "No name"}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <span style={statusPillStyle(app.status)}>
                            {app.status || "-"}
                          </span>
                          <span style={pillStyle}>{app.jobs?.title || "-"}</span>
                          <span style={pillStyle}>
                            {app.jobs?.role_category || "Other"}
                          </span>
                          {app.review_label ? (
                            <span style={reviewLabelStyle(app.review_label)}>
                              {app.review_label}
                            </span>
                          ) : null}
                          {app.rating ? (
                            <span style={pillStyle}>
                              {"★".repeat(app.rating)}
                            </span>
                          ) : null}
                        </div>
                        <p style={{ margin: "10px 0 0 0", color: "#9fb0d0" }}>
                          {app.email || "-"} • {app.discord || "-"} •{" "}
                          {app.tracking_code || "-"}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => toggleApplication(app.id)}
                          style={ghostButtonStyle}
                        >
                          {isOpen ? "Hide Details" : "Show Details"}
                        </button>
                        <button
                          onClick={() =>
                            updateApplicationStatus(app.id, "Accepted")
                          }
                          style={successButtonStyle}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            updateApplicationStatus(app.id, "Rejected")
                          }
                          style={dangerButtonStyle}
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ marginTop: 18 }}>
                        <div className="applicationGrid">
                          <div>
                            <div
                              style={{
                                display: "grid",
                                gap: "6px",
                                color: "#9fb0d0",
                              }}
                            >
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Role:
                                </strong>{" "}
                                {app.jobs?.title || "-"}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Category:
                                </strong>{" "}
                                {app.jobs?.role_category || "Other"}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Tracking Code:
                                </strong>{" "}
                                {app.tracking_code || "-"}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Discord Username:
                                </strong>{" "}
                                {app.discord || "-"}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Discord Name:
                                </strong>{" "}
                                {app.discord_name || "-"}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Email:
                                </strong>{" "}
                                {app.email || "-"}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Age:
                                </strong>{" "}
                                {app.age || "-"}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Timezone:
                                </strong>{" "}
                                {app.timezone || "-"}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Availability:
                                </strong>{" "}
                                {app.availability || "-"}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: "#dbe7ff" }}>
                                  Submitted:
                                </strong>{" "}
                                {app.created_at
                                  ? new Date(
                                      app.created_at
                                    ).toLocaleDateString()
                                  : "-"}
                              </p>
                            </div>

                            <div
                              style={{
                                marginTop: 14,
                                padding: "14px",
                                borderRadius: "14px",
                                background: "#081225",
                                border: "1px solid #22304d",
                              }}
                            >
                              <strong>Experience</strong>
                              <p
                                style={{
                                  marginBottom: 0,
                                  color: "#dbe7ff",
                                  lineHeight: 1.7,
                                }}
                              >
                                {app.experience || "-"}
                              </p>
                            </div>

                            <div
                              style={{
                                marginTop: 14,
                                padding: "14px",
                                borderRadius: "14px",
                                background: "#081225",
                                border: "1px solid #22304d",
                              }}
                            >
                              <strong>Motivation</strong>
                              <p
                                style={{
                                  marginBottom: 0,
                                  color: "#dbe7ff",
                                  lineHeight: 1.7,
                                }}
                              >
                                {app.motivation || "-"}
                              </p>
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                padding: "14px",
                                borderRadius: "14px",
                                background: "#081225",
                                border: "1px solid #22304d",
                                marginBottom: 14,
                              }}
                            >
                              <strong>Internal Review</strong>

                              <div style={{ marginTop: 12 }}>
                                <p
                                  style={{
                                    margin: "0 0 8px 0",
                                    color: "#9fb0d0",
                                  }}
                                >
                                  Rating
                                </p>

                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() =>
                                        updateApplicationRating(app.id, star)
                                      }
                                      style={{
                                        padding: "10px 14px",
                                        borderRadius: "12px",
                                        border:
                                          app.rating === star
                                            ? "1px solid rgba(76, 201, 240, 0.4)"
                                            : "1px solid #22304d",
                                        background:
                                          app.rating === star
                                            ? "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)"
                                            : "rgba(11, 21, 43, 0.9)",
                                        color: "white",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {"★".repeat(star)}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div style={{ marginTop: 14 }}>
                                <p
                                  style={{
                                    margin: "0 0 8px 0",
                                    color: "#9fb0d0",
                                  }}
                                >
                                  Review Label
                                </p>

                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {["interessant", "später", "abgelehnt"].map(
                                    (label) => (
                                      <button
                                        key={label}
                                        onClick={() =>
                                          updateApplicationReviewLabel(
                                            app.id,
                                            label
                                          )
                                        }
                                        style={{
                                          padding: "10px 14px",
                                          borderRadius: "12px",
                                          border:
                                            app.review_label === label
                                              ? "1px solid rgba(76, 201, 240, 0.4)"
                                              : "1px solid #22304d",
                                          background:
                                            app.review_label === label
                                              ? "linear-gradient(90deg, #4cc9f0 0%, #7b61ff 100%)"
                                              : "rgba(11, 21, 43, 0.9)",
                                          color: "white",
                                          fontWeight: 700,
                                          cursor: "pointer",
                                          textTransform: "capitalize",
                                        }}
                                      >
                                        {label}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>

                              <div
                                style={{
                                  marginTop: 14,
                                  color: "#9fb0d0",
                                  lineHeight: 1.7,
                                }}
                              >
                                <p style={{ margin: 0 }}>
                                  <strong style={{ color: "#dbe7ff" }}>
                                    Current Rating:
                                  </strong>{" "}
                                  {app.rating ? `${app.rating}/5` : "-"}
                                </p>
                                <p style={{ margin: 0 }}>
                                  <strong style={{ color: "#dbe7ff" }}>
                                    Current Label:
                                  </strong>{" "}
                                  {app.review_label || "-"}
                                </p>
                              </div>
                            </div>

                            <div
                              style={{
                                padding: "14px",
                                borderRadius: "14px",
                                background: "#081225",
                                border: "1px solid #22304d",
                                marginBottom: 14,
                              }}
                            >
                              <strong>Category Answers</strong>
                              <div
                                style={{
                                  display: "grid",
                                  gap: "10px",
                                  marginTop: 12,
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Developer Skills
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.developer_skills || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Developer Projects
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.developer_projects || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Support Cases
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.support_cases || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Support Communication
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.support_communication || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Competitive Knowledge
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.competitive_knowledge || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Competitive Plans
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.competitive_plans || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Manager Leadership
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.manager_leadership || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Manager Organization
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.manager_organization || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Director Vision
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.director_vision || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Director Responsibility
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.director_responsibility || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      margin: "0 0 6px 0",
                                      color: "#9fb0d0",
                                    }}
                                  >
                                    <strong style={{ color: "#dbe7ff" }}>
                                      Other Strengths
                                    </strong>
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#dbe7ff",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {app.other_strengths || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                padding: "14px",
                                borderRadius: "14px",
                                background: "#081225",
                                border: "1px solid #22304d",
                              }}
                            >
                              <strong>Internal Admin Notes</strong>
                              <textarea
                                defaultValue={app.notes || ""}
                                placeholder="Add internal notes for this application..."
                                style={{
                                  ...textareaStyle,
                                  minHeight: 120,
                                  marginTop: 10,
                                }}
                                onBlur={(e) =>
                                  updateApplicationNotes(app.id, e.target.value)
                                }
                              />
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                marginTop: "14px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                onClick={() =>
                                  updateApplicationStatus(app.id, "New")
                                }
                                style={ghostButtonStyle}
                              >
                                New
                              </button>
                              <button
                                onClick={() =>
                                  updateApplicationStatus(app.id, "Accepted")
                                }
                                style={successButtonStyle}
                              >
                                Accepted
                              </button>
                              <button
                                onClick={() =>
                                  updateApplicationStatus(app.id, "Rejected")
                                }
                                style={dangerButtonStyle}
                              >
                                Rejected
                              </button>
                              <button
                                onClick={() => deleteApplication(app.id)}
                                style={dangerButtonStyle}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredApplications.length === 0 && (
                <div style={{ ...panelStyle, color: "#9fb0d0" }}>
                  No applications found with the current filters.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}