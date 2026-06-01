import { useState } from "react";
import { signup, login } from "../services/authService";
import { saveUserProfile } from "../services/userService";

const WORK_STYLES = ["Fast-paced", "Steady & structured", "Flexible / async"];
const SLEEP_STYLES = ["Early bird", "Night owl", "All-nighter"];
const SKILL_OPTIONS = [
  "React", "Firebase", "UI Design", "Node.js", "Python",
  "GraphQL", "DevOps", "Mobile", "ML/AI", "Data Analysis",
];

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [skillsHave, setSkillsHave] = useState([]);
  const [skillsWant, setSkillsWant] = useState([]);
  const [workStyle, setWorkStyle] = useState("");
  const [sleep, setSleep] = useState("");
  const [role, setRole] = useState("");

  function toggleSkill(list, setList, skill) {
    setList((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(email, password); }
    catch (err) { setError(err.message.replace("Firebase: ", "").replace(/ \(.*\)\.?/, "")); }
    finally { setLoading(false); }
  }

  async function handleSignupProfile(e) {
    e.preventDefault();
    if (!name || skillsHave.length === 0 || skillsWant.length === 0 || !workStyle || !sleep) {
      setError("Please fill in all fields."); return;
    }
    setError(""); setLoading(true);
    try {
      const { user } = await signup(email, password);
      await saveUserProfile(user.uid, { name, skillsHave, skillsWant, role, workStyle, sleep });
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/ \(.*\)\.?/, ""));
    } finally { setLoading(false); }
  }

  return (
    <div className="grain min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "#F5E6D3" }}>
      <div className="w-full max-w-md slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="display" style={{ fontSize: "3.5rem", fontWeight: 700, color: "#2C1A0E", lineHeight: 1 }}>
            SkillSwap
          </h1>
          <p className="display" style={{ fontSize: "1.2rem", color: "#A0622A", marginTop: "4px" }}>
            trade skills. build together ✦
          </p>
        </div>

        {/* Main card */}
        <div className="sketch-card" style={{ padding: "28px" }}>

          {/* Tab toggle */}
          <div style={{
            display: "flex", background: "#F5E6D3", border: "2px solid #2C1A0E",
            borderRadius: "10px", padding: "4px", marginBottom: "28px",
          }}>
            {["login", "signup"].map((m) => (
              <button key={m} type="button"
                onClick={() => { setMode(m); setStep(1); setError(""); }}
                style={{
                  flex: 1, padding: "8px", borderRadius: "7px", fontSize: "0.875rem",
                  fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer",
                  border: "none", textTransform: "capitalize", transition: "all 0.15s",
                  background: mode === m ? "#2C1A0E" : "transparent",
                  color: mode === m ? "#FDF6EE" : "#7A5C3C",
                  boxShadow: mode === m ? "2px 2px 0 #A0622A" : "none",
                }}>
                {m}
              </button>
            ))}
          </div>

          {/* LOGIN */}
          {mode === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Input label="Email" type="email" value={email} onChange={setEmail} />
              <Input label="Password" type="password" value={password} onChange={setPassword} />
              {error && <ErrMsg msg={error} />}
              <SubmitBtn loading={loading}>Sign In →</SubmitBtn>
            </form>
          )}

          {/* SIGNUP step 1 */}
          {mode === "signup" && step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Input label="Email" type="email" value={email} onChange={setEmail} required />
              <Input label="Password (min 6 chars)" type="password" value={password} onChange={setPassword} required />
              <SubmitBtn>Continue →</SubmitBtn>
            </form>
          )}

          {/* SIGNUP step 2 */}
          {mode === "signup" && step === 2 && (
            <form onSubmit={handleSignupProfile} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <Input label="Your name" value={name} onChange={setName} required />
              <Input label="Role (e.g. Designer, Developer)" value={role} onChange={setRole} />
              <SkillPicker label="Skills you have ✦" selected={skillsHave}
                onToggle={(s) => toggleSkill(skillsHave, setSkillsHave, s)} activeColor="#C17D3C" />
              <SkillPicker label="Skills you want ✦" selected={skillsWant}
                onToggle={(s) => toggleSkill(skillsWant, setSkillsWant, s)} activeColor="#5C3317" />
              <RadioGroup label="Work style" options={WORK_STYLES} value={workStyle} onChange={setWorkStyle} />
              <RadioGroup label="Sleep schedule" options={SLEEP_STYLES} value={sleep} onChange={setSleep} />
              {error && <ErrMsg msg={error} />}
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setStep(1)} className="sketch-btn"
                  style={{ flex: 1, padding: "10px", fontSize: "0.875rem", background: "#F5E6D3", color: "#2C1A0E" }}>
                  ← Back
                </button>
                <SubmitBtn loading={loading} style={{ flex: 1 }}>Create Account ✓</SubmitBtn>
              </div>
            </form>
          )}
        </div>

        <p className="display" style={{ textAlign: "center", marginTop: "20px", fontSize: "1.1rem", color: "#A0622A" }}>
          ~ find your skill soulmate ~
        </p>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────── */

function Input({ label, type = "text", value, onChange, required }) {
  return (
    <div>
      <label className="display" style={{ display: "block", fontSize: "1rem", fontWeight: 600, color: "#2C1A0E", marginBottom: "6px" }}>
        {label}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="sketch-input" style={{ width: "100%", padding: "10px 14px", fontSize: "0.875rem" }} />
    </div>
  );
}

function SkillPicker({ label, selected, onToggle, activeColor }) {
  return (
    <div>
      <label className="display" style={{ display: "block", fontSize: "1rem", fontWeight: 600, color: "#2C1A0E", marginBottom: "8px" }}>
        {label}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {SKILL_OPTIONS.map((skill) => (
          <button key={skill} type="button" onClick={() => onToggle(skill)}
            style={{
              padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700,
              fontFamily: "'Nunito', sans-serif", cursor: "pointer", transition: "all 0.1s",
              background: selected.includes(skill) ? activeColor : "transparent",
              color: selected.includes(skill) ? "#FDF6EE" : "#5C3317",
              border: `2px solid ${selected.includes(skill) ? activeColor : "#A0622A"}`,
              boxShadow: selected.includes(skill) ? "2px 2px 0 #2C1A0E" : "none",
            }}>
            {skill}
          </button>
        ))}
      </div>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div>
      <label className="display" style={{ display: "block", fontSize: "1rem", fontWeight: 600, color: "#2C1A0E", marginBottom: "8px" }}>
        {label}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            style={{
              padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700,
              fontFamily: "'Nunito', sans-serif", cursor: "pointer", transition: "all 0.1s",
              background: value === opt ? "#2C1A0E" : "transparent",
              color: value === opt ? "#FDF6EE" : "#5C3317",
              border: `2px solid ${value === opt ? "#2C1A0E" : "#A0622A"}`,
              boxShadow: value === opt ? "2px 2px 0 #A0622A" : "none",
            }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SubmitBtn({ children, loading, style = {} }) {
  return (
    <button type="submit" disabled={loading} className="sketch-btn"
      style={{ width: "100%", padding: "11px", fontSize: "0.875rem", background: "#C17D3C", color: "#FDF6EE", ...style }}>
      {loading ? "Loading..." : children}
    </button>
  );
}

function ErrMsg({ msg }) {
  return (
    <p style={{
      fontSize: "0.875rem", fontWeight: 700, padding: "10px 14px", borderRadius: "8px",
      background: "#fde8e8", color: "#C0392B", border: "2px solid #C0392B",
    }}>⚠ {msg}</p>
  );
}