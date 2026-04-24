"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const from = searchParams.get("from") ?? "/";
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Incorrect password");
        setPassword("");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        inputRef.current?.focus();
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const databases = [
    { icon: "🐘", label: "PostgreSQL" },
    { icon: "🐬", label: "MySQL" },
    { icon: "🪐", label: "Cassandra" },
    { icon: "🔎", label: "Elasticsearch" },
    { icon: "⚡", label: "Redis" },
    { icon: "🕸️", label: "Neo4j" },
    { icon: "📈", label: "InfluxDB" },
    { icon: "🍃", label: "MongoDB" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      padding: "24px",
    }}>

      {/* Subtle grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗄️</div>
          <h1 style={{ margin: 0, color: "#f1f5f9", fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" }}>
            SQL Explorer
          </h1>
          <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 13 }}>
            8 databases · every paradigm
          </p>
        </div>

        {/* DB badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 36 }}>
          {databases.map((db) => (
            <span key={db.label} style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              color: "#94a3b8",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              {db.icon} {db.label}
            </span>
          ))}
        </div>

        {/* Login card */}
        <div style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 12,
          padding: 32,
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}>
          <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
            Enter password to access the explorer
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{
              animation: shake ? "shake 0.4s ease" : "none",
            }}>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#0f172a",
                  border: `1px solid ${error ? "#ef4444" : "#334155"}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: "#f1f5f9",
                  fontSize: 15,
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s",
                  marginBottom: 12,
                }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = "#6366f1"; }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = "#334155"; }}
              />
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 6,
                padding: "8px 12px",
                color: "#f87171",
                fontSize: 12,
                marginBottom: 12,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                ✗ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              style={{
                width: "100%",
                background: loading ? "#334155" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: loading || !password.trim() ? "not-allowed" : "pointer",
                opacity: !password.trim() ? 0.5 : 1,
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Verifying...
                </>
              ) : (
                <>Enter Explorer →</>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", color: "#334155", fontSize: 11, marginTop: 24 }}>
          Session valid for 7 days · Built with Next.js
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
