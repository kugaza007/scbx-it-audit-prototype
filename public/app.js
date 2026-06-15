import { buildExceptionCsv } from "./audit-export.js";

const catalog = {
  risk: {
    label: "Risk-based",
    kicker: "RISK-BASED APPROACH",
    title: "Which risk area would you like to explore?",
    description: "Choose a topic aligned with the risk universe or the organization's current priorities.",
    items: [
      { id: "access", icon: "◎", title: "Access Control", description: "Assess the user access lifecycle and the risk of unauthorized access." },
      { id: "configuration", icon: "⌘", title: "System Configuration", description: "Review configuration changes and secure baseline controls." },
      { id: "backup", icon: "↻", title: "Data Backup", description: "Confirm backup reliability and the ability to restore critical data." },
      { id: "patch", icon: "⬡", title: "Patch Management", description: "Track vulnerabilities and patch deployment against risk-based SLAs." },
      { id: "incident", icon: "!", title: "Incident Management", description: "Assess incident response, escalation, and lessons learned." },
    ],
  },
  compliance: {
    label: "Compliance-based",
    kicker: "COMPLIANCE-BASED APPROACH",
    title: "Choose a framework to assess",
    description: "The workspace will organize relevant controls and evidence around the selected framework.",
    items: [
      { id: "scbx", topic: "access", icon: "S", title: "SCBX Group Standards", description: "Internal standards for technology risk, cybersecurity, and data governance." },
      { id: "bot", topic: "configuration", icon: "B", title: "BOT Notification", description: "Bank of Thailand requirements for IT risk governance in financial institutions." },
      { id: "pdpa", topic: "access", icon: "P", title: "PDPA", description: "Assess personal data controls and data subject rights." },
      { id: "iso", topic: "patch", icon: "I", title: "ISO/IEC 27001", description: "Assess the information security management system and Annex A controls." },
      { id: "nist", topic: "incident", icon: "N", title: "NIST CSF", description: "Review Govern, Identify, Protect, Detect, Respond, and Recover capabilities." },
    ],
  },
};

const blueprints = {
  access: {
    inputs: [
      ["User Access List", "Accounts, assigned roles, status, and last login date", "CSV / XLSX"],
      ["HR Employee Status", "Employment status and termination date", "CSV / XLSX"],
      ["Access Approval", "Approver and approval date evidence", "LOG / CSV"],
      ["Role Matrix", "Permitted roles and privileges by job function", "PDF / XLSX"],
    ],
    procedures: [
      ["Validate population completeness", "Reconcile user accounts with source systems and HR records."],
      ["Identify terminated users", "Find active accounts belonging to terminated or inactive employees."],
      ["Review approval evidence", "Confirm access grants and changes were approved under the authority matrix."],
      ["Identify dormant accounts", "Find active accounts with no activity for more than 90 days."],
    ],
    outputs: [
      ["Executive summary", "Population, passed, exception, and pass-rate statistics", "REPORT"],
      ["Exception register", "Non-compliant accounts with risk ratings", "CSV"],
      ["Auditor narrative", "Draft finding covering condition, criteria, cause, and effect", "TEXT"],
    ],
  },
  configuration: {
    inputs: [
      ["Change Register", "Configuration changes within the audit period", "CSV / XLSX"],
      ["Approval Evidence", "Approval evidence from authorized personnel", "PDF / LOG"],
      ["Test Results", "UAT, security, or regression test results", "PDF / CSV"],
      ["Configuration Baseline", "Organization-approved configuration standards", "PDF / XLSX"],
    ],
    procedures: [
      ["Validate the change population", "Confirm completeness using tickets and system logs."],
      ["Review approvals", "Compare approvers with the authority matrix."],
      ["Review test results", "Confirm testing was completed before production deployment."],
      ["Compare against the baseline", "Identify deviations without supporting documentation."],
    ],
    outputs: [
      ["Change control summary", "Overview of change-control effectiveness", "REPORT"],
      ["Deviation list", "Configuration items that deviate from the baseline", "CSV"],
      ["Auditor narrative", "Draft finding for the audit working paper", "TEXT"],
    ],
  },
  backup: {
    inputs: [
      ["Backup Job Report", "Daily backup status and execution timestamps", "CSV"],
      ["Restore Test Result", "Restore results and measured RTO/RPO", "CSV / PDF"],
      ["Backup Policy", "Backup frequency, retention, and system scope", "PDF"],
    ],
    procedures: [
      ["Review backup status", "Identify failed, missed, and incomplete jobs."],
      ["Review coverage", "Compare critical systems with the approved backup scope."],
      ["Review restore testing", "Confirm tests were performed on schedule and met RTO/RPO."],
    ],
    outputs: [
      ["Backup health summary", "Success rate and exception count", "REPORT"],
      ["Failed job register", "Failed jobs requiring follow-up", "CSV"],
      ["Auditor narrative", "Draft finding and availability impact", "TEXT"],
    ],
  },
  patch: {
    inputs: [
      ["Vulnerability List", "Vulnerabilities, severity, and detection date", "CSV"],
      ["Patch Deployment", "Patch status for each asset", "CSV"],
      ["Asset Criticality", "System criticality and accountable owner", "CSV / XLSX"],
    ],
    procedures: [
      ["Reconcile vulnerabilities", "Connect each vulnerability with its asset and patch status."],
      ["Calculate item age", "Compare days open with severity-based SLAs."],
      ["Analyze overdue items", "Identify critical and high items that exceed the SLA."],
    ],
    outputs: [
      ["Patch compliance rate", "Percentage of vulnerabilities remediated within SLA", "REPORT"],
      ["Overdue register", "Overdue vulnerabilities ranked by risk", "CSV"],
      ["Auditor narrative", "Draft finding and vulnerability exposure", "TEXT"],
    ],
  },
  incident: {
    inputs: [
      ["Incident Register", "Incidents, severity, SLA, and status", "CSV"],
      ["Root Cause Analysis", "Root cause and recurrence-prevention plan", "PDF / CSV"],
      ["SLA Matrix", "Response and resolution SLA by severity", "PDF / XLSX"],
    ],
    procedures: [
      ["Validate incident completeness", "Reconcile tickets with alerts or event logs."],
      ["Review SLA performance", "Compare response and resolution times with SLA targets."],
      ["Review root cause analysis", "Confirm closed incidents include a cause and corrective action."],
    ],
    outputs: [
      ["Incident performance", "SLA, closed, and outstanding statistics", "REPORT"],
      ["SLA breach register", "Incidents that exceeded SLA targets", "CSV"],
      ["Auditor narrative", "Draft incident-response finding", "TEXT"],
    ],
  },
};

const demoRecords = {
  access: [
    { id: "USR-001", status: "active", employment_status: "active", approved: "yes", last_login_days: 4 },
    { id: "USR-002", status: "active", employment_status: "terminated", approved: "yes", last_login_days: 14 },
    { id: "USR-003", status: "active", employment_status: "active", approved: "pending", last_login_days: 35 },
    { id: "USR-004", status: "active", employment_status: "active", approved: "yes", last_login_days: 122 },
    { id: "USR-005", status: "disabled", employment_status: "terminated", approved: "yes", last_login_days: 185 },
    { id: "USR-006", status: "active", employment_status: "active", approved: "yes", last_login_days: 2 },
    { id: "USR-007", status: "active", employment_status: "active", approved: "yes", last_login_days: 18 },
    { id: "USR-008", status: "active", employment_status: "active", approved: "yes", last_login_days: 9 },
    { id: "USR-009", status: "active", employment_status: "resigned", approved: "no", last_login_days: 97 },
    { id: "USR-010", status: "active", employment_status: "active", approved: "yes", last_login_days: 44 },
    { id: "USR-011", status: "active", employment_status: "active", approved: "yes", last_login_days: 21 },
    { id: "USR-012", status: "active", employment_status: "active", approved: "yes", last_login_days: 8 },
  ],
  configuration: [
    { id: "CHG-001", approved: "yes", tested: "passed" }, { id: "CHG-002", approved: "no", tested: "passed" },
    { id: "CHG-003", approved: "yes", tested: "not tested" }, { id: "CHG-004", approved: "yes", tested: "passed" },
    { id: "CHG-005", approved: "yes", tested: "passed" }, { id: "CHG-006", approved: "pending", tested: "failed" },
    { id: "CHG-007", approved: "yes", tested: "passed" }, { id: "CHG-008", approved: "yes", tested: "passed" },
    { id: "CHG-009", approved: "yes", tested: "passed" }, { id: "CHG-010", approved: "yes", tested: "passed" },
    { id: "CHG-011", approved: "yes", tested: "passed" }, { id: "CHG-012", approved: "yes", tested: "passed" },
  ],
  backup: [
    { id: "BKP-001", status: "success", restore_test: "passed" }, { id: "BKP-002", status: "failed", restore_test: "passed" },
    { id: "BKP-003", status: "success", restore_test: "overdue" }, { id: "BKP-004", status: "success", restore_test: "passed" },
    { id: "BKP-005", status: "incomplete", restore_test: "not tested" }, { id: "BKP-006", status: "success", restore_test: "passed" },
    { id: "BKP-007", status: "success", restore_test: "passed" }, { id: "BKP-008", status: "success", restore_test: "passed" },
    { id: "BKP-009", status: "success", restore_test: "passed" }, { id: "BKP-010", status: "success", restore_test: "passed" },
    { id: "BKP-011", status: "success", restore_test: "passed" }, { id: "BKP-012", status: "success", restore_test: "passed" },
  ],
  patch: [
    { id: "VUL-001", severity: "critical", age_days: 45, status: "open" }, { id: "VUL-002", severity: "high", age_days: 12, status: "open" },
    { id: "VUL-003", severity: "critical", age_days: 8, status: "open" }, { id: "VUL-004", severity: "high", age_days: 71, status: "open" },
    { id: "VUL-005", severity: "medium", age_days: 92, status: "open" }, { id: "VUL-006", severity: "critical", age_days: 50, status: "closed" },
    { id: "VUL-007", severity: "high", age_days: 18, status: "open" }, { id: "VUL-008", severity: "critical", age_days: 3, status: "open" },
    { id: "VUL-009", severity: "high", age_days: 4, status: "failed" }, { id: "VUL-010", severity: "low", age_days: 100, status: "open" },
    { id: "VUL-011", severity: "high", age_days: 52, status: "open" }, { id: "VUL-012", severity: "critical", age_days: 22, status: "open" },
  ],
  incident: [
    { id: "INC-001", sla_status: "met", status: "closed", rca: "complete" }, { id: "INC-002", sla_status: "breached", status: "closed", rca: "complete" },
    { id: "INC-003", sla_status: "met", status: "closed", rca: "missing" }, { id: "INC-004", sla_status: "met", status: "open", rca: "pending" },
    { id: "INC-005", sla_status: "overdue", status: "open", rca: "pending" }, { id: "INC-006", sla_status: "met", status: "closed", rca: "complete" },
    { id: "INC-007", sla_status: "met", status: "closed", rca: "complete" }, { id: "INC-008", sla_status: "met", status: "closed", rca: "complete" },
    { id: "INC-009", sla_status: "met", status: "closed", rca: "complete" }, { id: "INC-010", sla_status: "met", status: "closed", rca: "complete" },
    { id: "INC-011", sla_status: "met", status: "closed", rca: "complete" }, { id: "INC-012", sla_status: "met", status: "closed", rca: "complete" },
  ],
};

const auditRules = {
  access: {
    title: "Access Control",
    criteria: "Access must align with job responsibilities, receive appropriate approval, and be disabled promptly when employment ends.",
    check(record) {
      const status = recordValue(record, ["status", "account_status"]);
      const employment = recordValue(record, ["employment_status", "employee_status"]);
      const approved = recordValue(record, ["approved", "approval_status"]);
      const lastLogin = recordValue(record, ["last_login_days", "days_since_login"]);
      const issues = [];
      if (!status || !employment || !approved) issues.push("Account, employment, or approval data is incomplete");
      if (["terminated", "resigned", "inactive"].includes(employment) && status === "active") issues.push("A terminated employee account remains active");
      if (["no", "false", "pending", "unapproved"].includes(approved)) issues.push("Access approval evidence is missing");
      if (Number(lastLogin) > 90 && status === "active") issues.push("The active account has been dormant for more than 90 days");
      return issues;
    },
  },
  configuration: {
    title: "System Configuration",
    criteria: "Configuration changes must be approved, tested, and supported by an auditable record.",
    check(record) {
      const approved = recordValue(record, ["approved", "approval_status"]);
      const tested = recordValue(record, ["tested", "test_status"]);
      const issues = [];
      if (!approved || !tested) issues.push("Approval or testing data is incomplete");
      if (["no", "false", "pending", "unapproved"].includes(approved)) issues.push("The configuration change was not approved");
      if (["no", "false", "failed", "not tested"].includes(tested)) issues.push("Complete testing evidence was not provided");
      return issues;
    },
  },
  backup: {
    title: "Data Backup",
    criteria: "Backup jobs must complete as scheduled and restoration must be tested in line with the approved plan.",
    check(record) {
      const status = recordValue(record, ["status", "backup_status"]);
      const restore = recordValue(record, ["restore_test", "restore_status"]);
      const issues = [];
      if (!status || !restore) issues.push("Backup or restore-test status is incomplete");
      if (["failed", "error", "incomplete", "missed"].includes(status)) issues.push("The backup job did not complete successfully");
      if (["failed", "no", "not tested", "overdue"].includes(restore)) issues.push("Restore testing did not meet the approved plan");
      return issues;
    },
  },
  patch: {
    title: "Patch Management",
    criteria: "Critical vulnerabilities must be remediated within 30 days and high vulnerabilities within 60 days.",
    check(record) {
      const severity = recordValue(record, ["severity", "risk"]);
      const ageValue = recordValue(record, ["age_days", "days_open", "overdue_days"]);
      const age = Number(ageValue);
      const status = recordValue(record, ["status", "patch_status"]);
      const issues = [];
      if (!severity || !ageValue || !status) issues.push("Severity, item age, or patch status is incomplete");
      if (severity === "critical" && age > 30 && status !== "closed") issues.push("Critical patch exceeded the 30-day SLA");
      if (severity === "high" && age > 60 && status !== "closed") issues.push("High patch exceeded the 60-day SLA");
      if (["failed", "error"].includes(status)) issues.push("Patch deployment failed");
      return issues;
    },
  },
  incident: {
    title: "Incident Management",
    criteria: "Incidents must be handled within SLA and closed with a documented root cause analysis.",
    check(record) {
      const sla = recordValue(record, ["sla_status", "response_sla"]);
      const status = recordValue(record, ["status", "incident_status"]);
      const rca = recordValue(record, ["rca", "root_cause"]);
      const issues = [];
      if (!sla || !status || !rca) issues.push("SLA, incident status, or root-cause data is incomplete");
      if (["breached", "overdue", "failed"].includes(sla)) issues.push("Incident response exceeded the SLA");
      if (status === "closed" && ["", "no", "missing", "pending"].includes(rca)) issues.push("The incident was closed without a root cause analysis");
      return issues;
    },
  },
};

function recordValue(record, keys) {
  for (const key of keys) {
    const found = Object.keys(record).find((candidate) => candidate.toLowerCase().trim() === key);
    if (found !== undefined) return String(record[found] ?? "").trim().toLowerCase();
  }
  return "";
}

function analyzeLocally(records, topic, standard) {
  const rule = auditRules[topic] || auditRules.access;
  const exceptions = [];
  records.forEach((record, index) => {
    const issues = rule.check(record);
    if (!issues.length) return;
    exceptions.push({
      row: index + 1,
      reference: record.id || record.user_id || record.asset_id || record.ticket_id || `REC-${String(index + 1).padStart(3, "0")}`,
      issue: issues.join("; "),
      risk: issues.some((issue) => /Critical|terminated|failed/i.test(issue)) ? "High" : "Medium",
      record,
    });
  });

  const total = records.length;
  const exceptionCount = exceptions.length;
  const passed = total - exceptionCount;
  const passRate = total ? Math.round((passed / total) * 100) : 0;
  const framework = standard || "SCBX Group Standards and relevant good practices";
  const narrative = total
    ? `We reviewed ${total.toLocaleString("en-US")} ${rule.title} records and found that ${passed.toLocaleString("en-US")} records met the criteria, while ${exceptionCount.toLocaleString("en-US")} exceptions were identified, resulting in a ${passRate}% pass rate. The exceptions were not aligned with ${framework}, which requires that ${rule.criteria.toLowerCase()} The condition may have resulted from incomplete monitoring and control-review procedures. This increases the risk of unauthorized access, service disruption, or non-compliance with applicable requirements. Management should remediate the identified exceptions and strengthen ongoing monitoring.`
    : "There is insufficient evidence to draft an audit finding. Import the relevant records before running the analysis.";

  return {
    generatedAt: new Date().toISOString(),
    topic: rule.title,
    criteria: rule.criteria,
    summary: { total, passed, exceptions: exceptionCount, passRate },
    exceptions,
    narrative,
  };
}

const state = { step: 1, approach: null, selection: null, topic: null, standard: null, tab: "inputs", records: [], report: null };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function goToStep(step) {
  state.step = step;
  $$(".stage-panel").forEach((panel) => panel.classList.toggle("active", Number(panel.dataset.stage) === step));
  $$(".step").forEach((item, index) => {
    const position = index + 1;
    item.classList.toggle("active", position === step);
    item.classList.toggle("completed", position < step);
    item.classList.toggle("clickable", position < step);
  });
  $$(".step-line").forEach((line, index) => line.classList.toggle("done", index + 1 < step));
  $("#pageTitle").textContent = ["New audit", "Define audit scope", "Audit blueprint", "Evidence analysis"][step - 1];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function chooseApproach(approach) {
  state.approach = approach;
  state.selection = null;
  state.topic = null;
  state.standard = null;
  const group = catalog[approach];
  $("#stage2Kicker").textContent = group.kicker;
  $("#stage2Title").textContent = group.title;
  $("#stage2Description").textContent = group.description;
  $("#selectionGrid").innerHTML = group.items.map((item) => `
    <button class="selection-card" data-id="${item.id}">
      <span class="selection-icon">${item.icon}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <span class="select-link">Select this topic →</span>
    </button>
  `).join("");
  $$(".selection-card").forEach((card) => card.addEventListener("click", () => chooseSelection(card.dataset.id)));
  goToStep(2);
}

function chooseSelection(id) {
  const item = catalog[state.approach].items.find((entry) => entry.id === id);
  state.selection = item;
  state.topic = item.topic || item.id;
  state.standard = state.approach === "compliance" ? item.title : null;
  $("#blueprintTitle").textContent = `${item.title} audit blueprint`;
  $("#metaApproach").textContent = catalog[state.approach].label;
  $("#metaTopic").textContent = item.title;
  state.tab = "inputs";
  renderBlueprint();
  goToStep(3);
}

function renderBlueprint() {
  const blueprint = blueprints[state.topic] || blueprints.access;
  $$(".blueprint-tabs button").forEach((button) => button.classList.toggle("active", button.dataset.tab === state.tab));
  const headings = {
    inputs: ["Evidence to prepare", "These items support a complete analysis and reduce follow-up requests."],
    procedures: ["Audit procedures", "The evidence will be assessed using the following sequence."],
    outputs: ["Expected deliverables", "Outputs are structured for the working paper and audit report."],
  };
  const [title, description] = headings[state.tab];
  if (state.tab === "procedures") {
    $("#blueprintContent").innerHTML = `<h3>${title}</h3><p>${description}</p><ol class="procedure-list">${blueprint.procedures.map(([name, detail]) => `<li><strong>${name}</strong>${detail}</li>`).join("")}</ol>`;
    return;
  }
  $("#blueprintContent").innerHTML = `<h3>${title}</h3><p>${description}</p><ul class="check-list">${blueprint[state.tab].map(([name, detail, format]) => `<li><span>✓</span><div><strong>${name}</strong><small>${detail}</small></div><i>${format}</i></li>`).join("")}</ul>`;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("The CSV must contain a header row and at least one record.");
  const parseLine = (line) => {
    const result = [];
    let current = "";
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (quoted && line[i + 1] === '"') { current += '"'; i += 1; } else quoted = !quoted;
      } else if (char === "," && !quoted) { result.push(current.trim()); current = ""; } else current += char;
    }
    result.push(current.trim());
    return result;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function setRecords(records, name, size = null) {
  state.records = records;
  $("#dropzone").hidden = true;
  $("#fileReady").hidden = false;
  $("#fileName").textContent = name;
  $("#fileMeta").textContent = `${size ?? `${records.length} sample records`} · Ready to analyze`;
  $("#recordCount").textContent = `${records.length.toLocaleString("en-US")} Records`;
  $("#analyzeBar").hidden = false;
}

async function handleFile(file) {
  if (!file || !file.name.toLowerCase().endsWith(".csv")) return showToast("Please choose a CSV file.");
  if (file.size > 10 * 1024 * 1024) return showToast("The file exceeds the 10 MB limit.");
  try {
    const records = parseCsv(await file.text());
    setRecords(records, file.name, `${(file.size / 1024).toFixed(1)} KB`);
  } catch (error) {
    showToast(error.message);
  }
}

function clearFile() {
  state.records = [];
  $("#fileInput").value = "";
  $("#dropzone").hidden = false;
  $("#fileReady").hidden = true;
  $("#analyzeBar").hidden = true;
}

async function analyzeRecords() {
  if (!state.records.length) return;
  $("#uploadSection").hidden = true;
  $("#analyzeBar").hidden = true;
  $("#loadingState").hidden = false;
  const messages = ["Checking data completeness...", "Testing records against the control criteria...", "Preparing the auditor narrative..."];
  let messageIndex = 0;
  const ticker = setInterval(() => { messageIndex = (messageIndex + 1) % messages.length; $("#loadingText").textContent = messages[messageIndex]; }, 650);
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    state.report = analyzeLocally(state.records, state.topic, state.standard);
    renderReport();
  } catch (error) {
    $("#uploadSection").hidden = false;
    $("#analyzeBar").hidden = false;
    showToast(error.message);
  } finally {
    clearInterval(ticker);
    $("#loadingState").hidden = true;
  }
}

function renderReport() {
  const report = state.report;
  $("#report").hidden = false;
  $("#reportTopic").textContent = report.topic;
  $("#reportTime").textContent = `Generated ${new Date(report.generatedAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}`;
  $("#totalRecords").textContent = report.summary.total.toLocaleString("en-US");
  $("#passedRecords").textContent = report.summary.passed.toLocaleString("en-US");
  $("#exceptionRecords").textContent = report.summary.exceptions.toLocaleString("en-US");
  $("#passRate").textContent = `${report.summary.passRate}%`;
  $("#rateRing").style.setProperty("--progress", `${report.summary.passRate}%`);
  $("#healthLabel").textContent = report.summary.passRate >= 90 ? "Healthy" : report.summary.passRate >= 70 ? "Monitor" : "Needs improvement";
  $("#healthLabel").style.color = report.summary.passRate >= 90 ? "var(--green)" : report.summary.passRate >= 70 ? "var(--yellow)" : "var(--coral)";
  $("#exceptionTable").innerHTML = report.exceptions.length
    ? report.exceptions.map((item) => `<tr><td>#${String(item.row).padStart(3, "0")}</td><td>${escapeHtml(item.reference)}</td><td>${escapeHtml(item.issue)}</td><td><span class="risk-badge ${item.risk.toLowerCase()}">${item.risk}</span></td></tr>`).join("")
    : `<tr><td class="empty-table" colspan="4">No exceptions were identified in the tested records.</td></tr>`;
  $("#narrativeText").textContent = report.narrative;
  $("#criteriaText").textContent = report.criteria;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}

function resetAudit() {
  Object.assign(state, { step: 1, approach: null, selection: null, topic: null, standard: null, tab: "inputs", records: [], report: null });
  clearFile();
  $("#report").hidden = true;
  $("#uploadSection").hidden = false;
  goToStep(1);
}

function resetAnalysis() {
  $("#report").hidden = true;
  $("#uploadSection").hidden = false;
  clearFile();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function downloadReport() {
  if (!state.report) return;
  const report = state.report;
  const rows = report.exceptions.map((item) => `${item.row},${item.reference},"${item.issue.replaceAll('"', '""')}",${item.risk}`).join("\n");
  const text = `SCBX IT AUDIT REPORT\n\nTopic: ${report.topic}\nTotal Records: ${report.summary.total}\nPassed: ${report.summary.passed}\nExceptions: ${report.summary.exceptions}\nPass Rate: ${report.summary.passRate}%\n\nAUDITOR NARRATIVE\n${report.narrative}\n\nEXCEPTIONS\nRow,Reference,Issue,Risk\n${rows}`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\uFEFF" + text], { type: "text/plain;charset=utf-8" }));
  link.download = `SCBX_Audit_Report_${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadExceptionRegister() {
  if (!state.report?.exceptions.length) {
    showToast("No exceptions are available to download.");
    return;
  }

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\uFEFF" + buildExceptionCsv(state.report)], { type: "text/csv;charset=utf-8" }));
  link.download = `SCBX_Exception_Register_${state.topic}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Exception register downloaded.");
}

$$(".approach-card").forEach((card) => card.addEventListener("click", () => chooseApproach(card.dataset.approach)));
$$("[data-back]").forEach((button) => button.addEventListener("click", () => goToStep(Number(button.dataset.back))));
$$(".blueprint-tabs button").forEach((button) => button.addEventListener("click", () => { state.tab = button.dataset.tab; renderBlueprint(); }));
$$(".step").forEach((button) => button.addEventListener("click", () => { const target = Number(button.dataset.step); if (target < state.step) goToStep(target); }));
$("#continueToUpload").addEventListener("click", () => goToStep(4));
$("#chooseFile").addEventListener("click", () => $("#fileInput").click());
$("#fileInput").addEventListener("change", (event) => handleFile(event.target.files[0]));
$("#removeFile").addEventListener("click", clearFile);
$("#useDemo").addEventListener("click", () => setRecords(demoRecords[state.topic] || demoRecords.access, `SCBX_demo_${state.topic}.csv`));
$("#analyzeButton").addEventListener("click", analyzeRecords);
$("#newAuditButton").addEventListener("click", resetAudit);
$("#resetAnalysis").addEventListener("click", resetAnalysis);
$("#downloadReport").addEventListener("click", downloadReport);
$("#downloadExceptions").addEventListener("click", downloadExceptionRegister);
$("#recommendButton")?.addEventListener("click", () => { showToast("Risk-based is recommended for exploring priority risks."); setTimeout(() => chooseApproach("risk"), 650); });
$("#copyNarrative").addEventListener("click", async () => {
  await navigator.clipboard.writeText(state.report?.narrative || "");
  showToast("Auditor narrative copied.");
});
$("#mobileMenu").addEventListener("click", () => $(".sidebar").classList.toggle("open"));

const dropzone = $("#dropzone");
["dragenter", "dragover"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.add("dragging"); }));
["dragleave", "drop"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.remove("dragging"); }));
dropzone.addEventListener("drop", (event) => handleFile(event.dataTransfer.files[0]));
