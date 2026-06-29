"use client";

import { useState } from "react";

const AGENTS = [
  {
    id: "tarifs",
    icon: "💰",
    name: "Agent Tarifs",
    color: "#1a1a2e",
    accent: "#e94560",
    description: "Calcule prix de vente, marges et offres clients",
    systemPrompt: `Tu es l'Agent Tarifs de K9 Experience Solution S.A.R.L.-S (Luxembourg, TVA LU37311931). Tu calcules les prix de vente TVAC (TVA 3% Luxembourg), les marges et crées des offres commerciales. Produits: CProFood, Bel'Croc, ventilation G&C Systems, tapis Dog Runner & Firepaw. Méthode: prix achat + 50% markup minimum. Réponds de façon concise et structurée en français.`,
  },
  {
    id: "marketing",
    icon: "📣",
    name: "Agent Marketing",
    color: "#0f3460",
    accent: "#f5a623",
    description: "Crée contenu social media en 4 langues",
    systemPrompt: `Tu es l'Agent Marketing de K9 Experience Solution S.A.R.L.-S (Luxembourg). Tu crées du contenu marketing pour Facebook, Instagram, WhatsApp. Langues: français, allemand, anglais, luxembourgeois. Produits: alimentation chien/chat (CProFood, Bel'Croc), ventilation véhicules (G&C Systems), tapis de course (Dog Runner, Firepaw). Réponds toujours avec du contenu prêt à publier, avec emojis et hashtags adaptés.`,
  },
  {
    id: "fournisseurs",
    icon: "🤝",
    name: "Agent Fournisseurs",
    color: "#16213e",
    accent: "#00b4d8",
    description: "Rédige courriers et négocie avec fournisseurs",
    systemPrompt: `Tu es l'Agent Fournisseurs de K9 Experience Solution S.A.R.L.-S (Luxembourg, 177 Rue de Luxembourg L-8077 Bertrange, TVA LU37311931, RCS B305408). Gérant: Dirk Filzen, tél: +352 621 782 523, email: k9.exp.solutions@icloud.com. Tu rédiges des courriers professionnels aux fournisseurs (G&C Systems, Bel'Croc, CProFood, Firepaw, Dog Runner). Langues selon fournisseur: français, anglais, néerlandais, allemand. Ton professionnel, formel et commercial.`,
  },
  {
    id: "juridique",
    icon: "⚖️",
    name: "Agent Juridique",
    color: "#1a1a2e",
    accent: "#7b2d8b",
    description: "Aide administrative, TVA Luxembourg, documents officiels",
    systemPrompt: `Tu es l'Agent Administratif & Juridique de K9 Experience Solution S.A.R.L.-S. Société luxembourgeoise, TVA LU37311931, RCS B305408, siège: 177 Rue de Luxembourg L-8077 Bertrange. Gérant: Dirk Filzen, résident allemand (Schönecken), nationalité belge, travailleur frontalier. Tu aides avec: TVA Luxembourg (3%), documents officiels, courriers administratifs, conformité. Tu n'es pas avocat - tu fournis de l'aide générale.`,
  },
  {
    id: "logistique",
    icon: "🚚",
    name: "Agent Logistique",
    color: "#0f3460",
    accent: "#2ecc71",
    description: "Gestion stocks, commandes, livraisons",
    systemPrompt: `Tu es l'Agent Logistique de K9 Experience Solution S.A.R.L.-S (Luxembourg). Tu gères: commandes fournisseurs, stocks, livraisons clients, planning. Produits: CProFood (CERAL sa, Belgique), Bel'Croc (Belgique), G&C Systems (Pays-Bas), Firepaw (Bulgarie), Dog Runner. Tu aides à optimiser les commandes, calculer les quantités et planifier les livraisons.`,
  },
  {
    id: "marche",
    icon: "📊",
    name: "Agent Marché",
    color: "#0d2137",
    accent: "#00e5ff",
    description: "Analyse concurrence, tendances et opportunités",
    systemPrompt: `Tu es l'Agent Étude de Marché de K9 Experience Solution S.A.R.L.-S (Luxembourg). Tu analyses: concurrence, tendances du marché canin, opportunités commerciales, positionnement prix. Marchés couverts: Luxembourg, Belgique, France, Allemagne, Pays-Bas. Secteurs: alimentation premium, ventilation véhicules canins, tapis de course canin, formation K9.`,
  },
  {
    id: "multiagent",
    icon: "🧠",
    name: "Tous les Agents",
    color: "#2d1b69",
    accent: "#ff6b6b",
    description: "Lance tous les agents simultanément",
    systemPrompt: "",
  },
];

const NORMAL_AGENTS = AGENTS.filter((a) => a.id !== "multiagent");

// ✅ Appel via le serveur Next.js — la clé API n'est jamais exposée au navigateur
async function askClaude(systemPrompt, userMessage) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const block = Array.isArray(data.content) && data.content.find((b) => b.type === "text");
  if (block) return block.text;
  throw new Error("Réponse vide");
}

export default function K9Agents() {
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("agents");

  const runOne = async (agent, msg) => {
    setLoading((l) => ({ ...l, [agent.id]: true }));
    setError((e) => ({ ...e, [agent.id]: null }));
    try {
      const text = await askClaude(agent.systemPrompt, msg);
      setResults((r) => ({ ...r, [agent.id]: text }));
      setHistory((h) => [
        { agent: agent.name, icon: agent.icon, input: msg, output: text, time: new Date().toLocaleTimeString(), accent: agent.accent },
        ...h.slice(0, 19),
      ]);
    } catch (e) {
      setError((er) => ({ ...er, [agent.id]: e.message }));
    }
    setLoading((l) => ({ ...l, [agent.id]: false }));
  };

  const handleSend = () => {
    if (!selected || !input.trim()) return;
    const msg = input.trim();
    setInput("");
    setActiveTab("results");
    if (selected.id === "multiagent") {
      NORMAL_AGENTS.forEach((a) => runOne(a, msg));
    } else {
      runOne(selected, msg);
    }
  };

  const hasResults = Object.keys(results).length > 0;
  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>

      <div style={{ textAlign: "center", padding: "24px 20px 16px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#444", marginBottom: "6px", textTransform: "uppercase" }}>K9 Experience Solution S.A.R.L.-S</div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px", background: "linear-gradient(135deg, #e94560, #f5a623)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Système Multi-Agents
        </h1>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>Bertrange, Luxembourg · TVA LU37311931</p>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1a1a28", padding: "0 20px" }}>
        {[["agents", "🤖 Agents"], ["results", `📋 Résultats${hasResults ? ` (${Object.keys(results).length})` : ""}`], ["history", `🕐 Historique${history.length ? ` (${history.length})` : ""}`]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            background: "none", border: "none", color: activeTab === id ? "#e8e8f0" : "#555",
            borderBottom: activeTab === id ? "2px solid #e94560" : "2px solid transparent",
            padding: "10px 16px", fontSize: "12px", fontWeight: "600", cursor: "pointer", marginBottom: "-1px",
          }}>{label}</button>
        ))}
        {isAnyLoading && <div style={{ marginLeft: "auto", alignSelf: "center", fontSize: "11px", color: "#f5a623" }}>⏳ En cours...</div>}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>

        {activeTab === "agents" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px", marginBottom: "20px" }}>
              {AGENTS.map((agent) => {
                const isSel = selected?.id === agent.id;
                return (
                  <div key={agent.id} onClick={() => setSelected(agent)} style={{
                    background: isSel ? agent.color : "#111118",
                    border: `2px solid ${isSel ? agent.accent : "#1e1e2e"}`,
                    borderRadius: "12px", padding: "14px", cursor: "pointer",
                    transition: "border-color 0.15s", position: "relative", overflow: "hidden",
                  }}>
                    {isSel && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: agent.accent }} />}
                    <div style={{ fontSize: "22px", marginBottom: "8px" }}>{agent.icon}</div>
                    <div style={{ fontWeight: "700", fontSize: "12px", marginBottom: "4px", color: isSel ? agent.accent : "#ccc" }}>{agent.name}</div>
                    <div style={{ fontSize: "10px", color: "#555", lineHeight: 1.4 }}>{agent.description}</div>
                    {loading[agent.id] && <div style={{ position: "absolute", top: "8px", right: "8px", width: "6px", height: "6px", borderRadius: "50%", background: agent.accent, animation: "blink 1s infinite" }} />}
                  </div>
                );
              })}
            </div>

            {selected && (
              <div style={{ background: "#111118", border: `1px solid ${selected.accent}44`, borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: selected.accent, fontWeight: "700", letterSpacing: "1px", marginBottom: "10px" }}>
                  {selected.icon} {selected.name.toUpperCase()} — PRÊT
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSend(); }}
                  placeholder={selected.id === "multiagent" ? "Tous les agents vont analyser ta demande simultanément..." : `Décris ta tâche pour ${selected.name}...`}
                  style={{
                    width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a",
                    borderRadius: "8px", color: "#e8e8f0", padding: "12px", fontSize: "14px",
                    resize: "vertical", minHeight: "90px", outline: "none", boxSizing: "border-box",
                    fontFamily: "inherit", lineHeight: 1.5,
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <span style={{ fontSize: "11px", color: "#444" }}>Ctrl+Enter pour envoyer</span>
                  <button onClick={handleSend} disabled={!input.trim()} style={{
                    background: input.trim() ? selected.accent : "#222",
                    color: input.trim() ? "#fff" : "#555",
                    border: "none", borderRadius: "8px", padding: "10px 20px",
                    fontWeight: "700", fontSize: "13px", cursor: input.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                  }}>
                    {selected.id === "multiagent" ? "🚀 Lancer tous" : "▶ Envoyer"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "results" && (
          <div style={{ display: "grid", gap: "12px" }}>
            {!hasResults && !isAnyLoading && (
              <div style={{ textAlign: "center", color: "#444", padding: "40px", fontSize: "14px" }}>
                Aucun résultat encore — sélectionne un agent et envoie une tâche.
              </div>
            )}
            {AGENTS.filter((a) => a.id !== "multiagent" && (results[a.id] || loading[a.id] || error[a.id])).map((agent) => (
              <div key={agent.id} style={{ background: "#111118", border: `1px solid ${agent.accent}33`, borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ background: agent.color, padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{agent.icon}</span>
                  <span style={{ fontWeight: "700", fontSize: "13px", color: agent.accent }}>{agent.name}</span>
                  {loading[agent.id] && <span style={{ marginLeft: "auto", fontSize: "11px", color: "#888" }}>⏳ traitement...</span>}
                </div>
                <div style={{ padding: "16px", fontSize: "13px", lineHeight: 1.7, color: "#ccc", whiteSpace: "pre-wrap" }}>
                  {loading[agent.id]
                    ? <span style={{ color: "#444" }}>Génération en cours...</span>
                    : error[agent.id]
                    ? <span style={{ color: "#e94560" }}>❌ {error[agent.id]}</span>
                    : results[agent.id]}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div>
            {history.length === 0 && (
              <div style={{ textAlign: "center", color: "#444", padding: "40px", fontSize: "14px" }}>Aucun historique encore.</div>
            )}
            {history.map((h, i) => (
              <div key={i} style={{ background: "#111118", border: "1px solid #1a1a28", borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: h.accent || "#888" }}>{h.icon} {h.agent}</span>
                  <span style={{ fontSize: "11px", color: "#444" }}>{h.time}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#555", marginBottom: "8px", fontStyle: "italic" }}>↳ {h.input}</div>
                <div style={{ fontSize: "12px", color: "#999", lineHeight: 1.6, borderTop: "1px solid #1e1e2e", paddingTop: "8px", whiteSpace: "pre-wrap" }}>
                  {h.output.slice(0, 300)}{h.output.length > 300 ? "..." : ""}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
    </div>
  );
}
