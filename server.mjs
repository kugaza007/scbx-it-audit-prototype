import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = join(ROOT, "public");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

const topicRules = {
  access: {
    title: "Access Control",
    criteria: "Access must align with job responsibilities, receive appropriate approval, and be disabled promptly when employment ends.",
    check(record) {
      const status = value(record, ["status", "account_status"]);
      const employment = value(record, ["employment_status", "employee_status"]);
      const approved = value(record, ["approved", "approval_status"]);
      const lastLogin = value(record, ["last_login_days", "days_since_login"]);
      const issues = [];
      if (!status || !employment || !approved) issues.push("Account, employment, or approval data is incomplete");
      if (["terminated", "resigned", "inactive"].includes(employment) && status === "active") {
        issues.push("A terminated employee account remains active");
      }
      if (["no", "false", "pending", "unapproved"].includes(approved)) {
        issues.push("Access approval evidence is missing");
      }
      if (Number(lastLogin) > 90 && status === "active") {
        issues.push("The active account has been dormant for more than 90 days");
      }
      return issues;
    },
  },
  configuration: {
    title: "System Configuration",
    criteria: "Configuration changes must be approved, tested, and supported by an auditable record.",
    check(record) {
      const approved = value(record, ["approved", "approval_status"]);
      const tested = value(record, ["tested", "test_status"]);
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
      const status = value(record, ["status", "backup_status"]);
      const restore = value(record, ["restore_test", "restore_status"]);
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
      const severity = value(record, ["severity", "risk"]);
      const age = Number(value(record, ["age_days", "days_open", "overdue_days"]));
      const status = value(record, ["status", "patch_status"]);
      const issues = [];
      if (!severity || !value(record, ["age_days", "days_open", "overdue_days"]) || !status) issues.push("Severity, item age, or patch status is incomplete");
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
      const sla = value(record, ["sla_status", "response_sla"]);
      const status = value(record, ["status", "incident_status"]);
      const rca = value(record, ["rca", "root_cause"]);
      const issues = [];
      if (!sla || !status || !rca) issues.push("SLA, incident status, or root-cause data is incomplete");
      if (["breached", "overdue", "failed"].includes(sla)) issues.push("Incident response exceeded the SLA");
      if (status === "closed" && ["", "no", "missing", "pending"].includes(rca)) issues.push("The incident was closed without a root cause analysis");
      return issues;
    },
  },
};

function value(record, keys) {
  for (const key of keys) {
    const found = Object.keys(record).find((candidate) => candidate.toLowerCase().trim() === key);
    if (found !== undefined) return String(record[found] ?? "").trim().toLowerCase();
  }
  return "";
}

function analyze(body) {
  const records = Array.isArray(body.records) ? body.records : [];
  const rule = topicRules[body.topic] || topicRules.access;
  const exceptions = [];

  records.forEach((record, index) => {
    const issues = rule.check(record);
    if (issues.length) {
      exceptions.push({
        row: index + 1,
        reference: record.id || record.user_id || record.asset_id || record.ticket_id || `REC-${String(index + 1).padStart(3, "0")}`,
        issue: issues.join("; "),
        risk: issues.some((issue) => /Critical|terminated|failed/i.test(issue)) ? "High" : "Medium",
        record,
      });
    }
  });

  const total = records.length;
  const exceptionCount = exceptions.length;
  const passed = total - exceptionCount;
  const passRate = total ? Math.round((passed / total) * 100) : 0;
  const framework = body.standard || "SCBX Group Standards and relevant good practices";
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

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { status: "ok", service: "aura-it-audit" });
    return;
  }

  if (request.method === "POST" && request.url === "/api/analyze") {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 10_000_000) request.destroy();
    });
    request.on("end", () => {
      try {
        sendJson(response, 200, analyze(JSON.parse(raw || "{}")));
      } catch {
        sendJson(response, 400, { error: "The submitted data could not be read." });
      }
    });
    return;
  }

  const requestPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`SCBX Audit Intelligence is ready at http://${HOST}:${PORT}`);
});
