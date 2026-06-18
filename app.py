from __future__ import annotations

import csv
import json
import re
import tempfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import gradio as gr
import pandas as pd

try:
    import pdfplumber
except Exception:  # pragma: no cover - optional runtime fallback
    pdfplumber = None

try:
    from pypdf import PdfReader
except Exception:  # pragma: no cover - optional runtime fallback
    PdfReader = None


APP_TITLE = "SCBX IT Audit Intelligence - Local Gradio"
EXPORT_DIR = Path(tempfile.gettempdir()) / "scbx_it_audit_exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


@dataclass(frozen=True)
class Topic:
    key: str
    title: str
    rule_key: str
    description: str


@dataclass(frozen=True)
class Requirement:
    reference: str
    source: str
    requirement: str
    topic: str
    objective: str
    evidence: str
    procedures: tuple[str, ...]


TOPICS: dict[str, Topic] = {
    "governance": Topic("governance", "IT Governance", "configuration", "Governance structure, accountability, oversight, and reporting."),
    "risk-management": Topic("risk-management", "IT Risk Management", "configuration", "Risk identification, assessment, treatment, and monitoring."),
    "asset": Topic("asset", "IT Asset Management", "configuration", "Completeness, ownership, classification, and lifecycle of IT assets."),
    "security": Topic("security", "Information Security", "access", "Security controls across data, network, and identity domains."),
    "access": Topic("access", "Access Control", "access", "User lifecycle, approval, entitlement review, and dormant accounts."),
    "physical": Topic("physical", "Physical and Environmental Security", "access", "Facility access, visitor control, monitoring, and environment safeguards."),
    "communications": Topic("communications", "Communications Security", "configuration", "Network connectivity, segmentation, and secure communications."),
    "change": Topic("change", "Change Management", "configuration", "Change approval, testing, deployment, and rollback evidence."),
    "configuration": Topic("configuration", "System Configuration", "configuration", "Configuration records, baselines, ownership, and deviations."),
    "logging": Topic("logging", "Logging", "incident", "Log coverage, retention, protection, and review evidence."),
    "capacity": Topic("capacity", "Capacity Management", "backup", "Capacity monitoring, forecasting, thresholds, and service continuity."),
    "monitoring": Topic("monitoring", "Security Monitoring", "incident", "Alert rules, triage, escalation, and response evidence."),
    "vulnerability": Topic("vulnerability", "Vulnerability Management and Penetration Test", "patch", "Vulnerability identification, remediation, and validation."),
    "backup": Topic("backup", "Data Backup", "backup", "Backup completion, restoration, encryption, and recovery evidence."),
    "patch": Topic("patch", "Patch Management", "patch", "Patch deployment and risk-based remediation SLA compliance."),
    "endpoint": Topic("endpoint", "Endpoint Security", "patch", "Endpoint coverage, managed device status, and protection controls."),
    "development": Topic("development", "System Acquisition and Development", "configuration", "Secure SDLC, testing, approvals, and release controls."),
    "incident": Topic("incident", "Incident Management", "incident", "Incident response, SLA, RCA, closure, and lessons learned."),
    "third-party": Topic("third-party", "Third Party Risk Management", "incident", "Supplier due diligence, contracts, monitoring, and security evidence."),
    "project": Topic("project", "IT Project Management", "configuration", "Project governance, risk, testing, implementation, and closure."),
}


BLUEPRINTS: dict[str, dict[str, list[tuple[str, str, str]]]] = {
    "access": {
        "inputs": [
            ("User Access List", "Accounts, roles, status, and last login date", "CSV / XLSX"),
            ("HR Employee Status", "Employment status and termination date", "CSV / XLSX"),
            ("Access Approval", "Approver and approval date evidence", "LOG / CSV"),
            ("Role Matrix", "Permitted roles and privileges by job function", "PDF / XLSX"),
        ],
        "outputs": [
            ("Executive summary", "Population, passed, exception, and pass-rate statistics", "REPORT"),
            ("Exception register", "Non-compliant accounts with risk ratings", "CSV"),
            ("Auditor narrative", "Draft finding covering condition, criteria, cause, and effect", "TEXT"),
        ],
    },
    "configuration": {
        "inputs": [
            ("Change Register", "Configuration changes or baseline records in scope", "CSV / XLSX"),
            ("Approval Evidence", "Approval evidence from authorized personnel", "PDF / LOG"),
            ("Test Results", "UAT, security, or regression test results", "PDF / CSV"),
            ("Configuration Baseline", "Organization-approved baseline", "PDF / XLSX"),
        ],
        "outputs": [
            ("Control summary", "Overview of operating effectiveness", "REPORT"),
            ("Deviation list", "Items that deviate from baseline or approval rules", "CSV"),
            ("Auditor narrative", "Draft finding for the audit working paper", "TEXT"),
        ],
    },
    "backup": {
        "inputs": [
            ("Backup Job Report", "Daily backup status and execution timestamps", "CSV / XLSX"),
            ("Restore Test Result", "Restore results and measured RTO/RPO", "CSV / PDF"),
            ("Backup Policy", "Backup frequency, retention, and system scope", "PDF"),
        ],
        "outputs": [
            ("Backup health summary", "Success rate and exception count", "REPORT"),
            ("Failed job register", "Failed jobs requiring follow-up", "CSV"),
            ("Auditor narrative", "Draft finding and availability impact", "TEXT"),
        ],
    },
    "patch": {
        "inputs": [
            ("Vulnerability List", "Vulnerabilities, severity, and detection date", "CSV / XLSX"),
            ("Patch Deployment", "Patch status for each asset", "CSV / XLSX"),
            ("Asset Criticality", "System criticality and accountable owner", "CSV / XLSX"),
        ],
        "outputs": [
            ("Patch compliance rate", "Percentage remediated within SLA", "REPORT"),
            ("Overdue register", "Overdue vulnerabilities ranked by risk", "CSV"),
            ("Auditor narrative", "Draft finding and vulnerability exposure", "TEXT"),
        ],
    },
    "incident": {
        "inputs": [
            ("Incident Register", "Incidents, severity, SLA, and status", "CSV / XLSX"),
            ("Root Cause Analysis", "Root cause and recurrence-prevention plan", "PDF / CSV"),
            ("SLA Matrix", "Response and resolution SLA by severity", "PDF / XLSX"),
        ],
        "outputs": [
            ("Incident performance", "SLA, closed, and outstanding statistics", "REPORT"),
            ("SLA breach register", "Incidents that exceeded SLA targets", "CSV"),
            ("Auditor narrative", "Draft incident-response finding", "TEXT"),
        ],
    },
}


CONTROL_REFERENCES: dict[str, list[Requirement]] = {
    "governance": [
        Requirement("TRM-GOV", "Technology Risk Management Standard", "Technology risk governance, roles, control oversight, and reporting must be established and maintained.", "IT Governance", "Assess governance accountability and control oversight.", "Governance charter, committee minutes, risk reports", ("Review technology risk governance structure and assigned ownership.", "Verify risk reporting, committee oversight, and management review evidence.")),
        Requirement("CTRA-AWARE", "Cybersecurity and Technology Risk Awareness Standard", "Personnel must receive awareness and training relevant to cybersecurity and technology risk responsibilities.", "IT Governance", "Confirm awareness coverage and completion.", "Training records and completion reports", ("Review training population and completion evidence.", "Identify overdue or missing awareness completion.")),
    ],
    "risk-management": [
        Requirement("TRM-RISK", "Technology Risk Management Standard", "Technology risks must be identified, assessed, monitored, and reported in line with assigned risk exposure tier.", "IT Risk Management", "Assess risk lifecycle operation.", "Risk registers, treatment plans, waiver approvals", ("Review risk assessment records and treatment plans.", "Validate status of risk actions and overdue remediation items.")),
    ],
    "asset": [
        Requirement("ITAM", "IT Asset Management Standard", "IT assets must be inventoried, owned, classified, maintained, and controlled throughout the asset lifecycle.", "IT Asset Management", "Verify asset inventory completeness and ownership.", "Asset inventory, owner list, disposal evidence", ("Reconcile asset inventory with source systems.", "Review missing owner, status, classification, or lifecycle information.")),
    ],
    "security": [
        Requirement("DSE", "Data Security and Encryption Standard", "Sensitive data must be protected according to classification, encryption, transmission, and handling requirements.", "Information Security", "Assess data protection evidence.", "Data classification, encryption evidence", ("Review classification and encryption evidence.", "Identify missing masking, handling, or encryption evidence.")),
        Requirement("NETSEC", "Network Security Standard", "Network security controls must restrict, monitor, and protect connectivity according to approved architecture.", "Information Security", "Assess network protection controls.", "Firewall rules, network diagrams, monitoring evidence", ("Review network segmentation and firewall rule evidence.", "Identify overly permissive connectivity or missing rule owner information.")),
    ],
    "access": [
        Requirement("IAM", "Identity and Access Management Standard", "User and privileged access must be requested, approved, reviewed, and removed in line with the access lifecycle.", "Access Control", "Ensure access is authorized, appropriate, and removed when no longer required.", "User listing, HR status, approval evidence, review evidence", ("Reconcile active accounts against HR status.", "Verify access request and approval evidence.", "Identify terminated, dormant, privileged, or unapproved accounts.")),
        Requirement("CLOUD-AC", "Cloud Security Standard", "Cloud portal, administrative, and provider access must follow least privilege, MFA, and periodic entitlement review requirements.", "Access Control", "Assess cloud administrative access governance.", "Cloud admin list, MFA evidence, entitlement review", ("Review cloud administrative access and MFA evidence.", "Verify entitlement review evidence.")),
    ],
    "physical": [
        Requirement("PES", "Physical and Environmental Security Standard", "Physical facilities and environmental controls must protect technology areas from unauthorized access, damage, or service disruption.", "Physical Security", "Assess facility access and environment safeguards.", "Physical access list, visitor logs, CCTV/environment reports", ("Review physical access list and authorization evidence.", "Check visitor, badge, CCTV, and environmental monitoring evidence.")),
    ],
    "communications": [
        Requirement("NETSEC", "Network Security Standard", "Network communication paths must be controlled through approved architecture, segmentation, firewall, and secure connectivity controls.", "Communications Security", "Assess network rule governance.", "Network diagrams, firewall rules, remote access records", ("Review approved network diagrams and firewall baselines.", "Identify open, unused, or unauthorized network rules.")),
    ],
    "change": [
        Requirement("CHG", "Change Management Standard", "Changes must be recorded, assessed, approved, tested, implemented, and reviewed according to change governance.", "Change Management", "Assess change control operation.", "Change tickets, approvals, testing, rollback evidence", ("Reconcile change tickets with deployment evidence.", "Verify risk assessment, approval, testing, and rollback evidence.")),
        Requirement("REL", "Release and Deployment Management Standard", "Release and deployment activities must be planned, authorized, tested, and supported by implementation evidence.", "Change Management", "Assess release readiness and implementation controls.", "Release package, deployment approval, result logs", ("Review release package completeness and deployment approval.", "Check deployment result, rollback, and communication evidence.")),
    ],
    "configuration": [
        Requirement("CFG", "Configuration Management Standard", "Configuration items and baselines must be identified, controlled, recorded, and maintained.", "System Configuration", "Assess configuration baseline control.", "Configuration register, baseline, deviation approval", ("Compare configuration records against approved baseline.", "Identify unsupported deviations or missing ownership.")),
        Requirement("CLOUD-ARCH", "Cloud Architecture Standard", "Cloud architecture must align with approved design, control, resilience, and governance requirements.", "System Configuration", "Assess cloud design governance.", "Architecture approval, design documents, landing-zone baseline", ("Review cloud architecture approval and design evidence.", "Check deviations from approved architecture.")),
    ],
    "logging": [
        Requirement("LOG", "Logging and Auditing Standard", "Security and system logs must be generated, retained, protected, monitored, and available for investigation.", "Logging", "Assess log coverage and retention.", "Log source list, SIEM integration, retention settings", ("Review log source coverage and centralized logging.", "Check retention, protection, and review evidence.")),
    ],
    "capacity": [
        Requirement("CAP", "Capacity Management Standard", "Capacity and performance must be monitored, analyzed, forecasted, and planned to meet service demand.", "Capacity Management", "Assess capacity monitoring and planning.", "Capacity dashboards, forecasts, thresholds", ("Review capacity metrics and thresholds.", "Check capacity plans, forecasts, and approval evidence.")),
    ],
    "monitoring": [
        Requirement("LOG-MON", "Logging and Auditing Standard", "Events and logs must support monitoring, detection, and investigation of security or operational incidents.", "Security Monitoring", "Assess alert coverage and triage.", "Alert rules, triage records, escalation evidence", ("Review alert rules and monitoring coverage.", "Identify critical events without triage or investigation evidence.")),
        Requirement("SIRM", "Security Incident Response and Management Standard", "Security incidents must be detected, reported, escalated, investigated, and closed with appropriate actions.", "Security Monitoring", "Assess incident escalation from alerts.", "Incident tickets, escalation records, closure evidence", ("Sample alerts and verify incident escalation and closure evidence.",)),
    ],
    "vulnerability": [
        Requirement("SRPM", "Security Remediation and Patch Management Standard", "Vulnerabilities must be identified, prioritized, remediated, verified, and tracked to closure.", "Vulnerability Management", "Assess vulnerability remediation lifecycle.", "Scan results, remediation status, retest evidence", ("Reconcile vulnerability scan results with remediation status.", "Calculate aging against severity-based remediation expectations.")),
    ],
    "backup": [
        Requirement("CLOUD-AVAIL", "Cloud Security Standard", "Backup copies, recovery procedures, backup access governance, restoration logs, and encryption must be maintained for protected data.", "Data Backup", "Assess backup reliability and restore readiness.", "Backup report, restore logs, encryption evidence", ("Review backup job status and failed backup evidence.", "Verify backup encryption, access controls, and recovery procedure evidence.")),
        Requirement("CAP-DR", "Capacity Management Standard", "Disaster recovery must be adopted where required to support business continuity and reduce service disruption risk.", "Data Backup", "Assess DR linkage for critical services.", "DR plan, recovery test, service criticality", ("Review DR or recovery planning linkage for critical services.",)),
    ],
    "patch": [
        Requirement("SRPM", "Security Remediation and Patch Management Standard", "Security patches and remediation must be prioritized, implemented, verified, and monitored based on risk.", "Patch Management", "Assess patch SLA compliance.", "Patch deployment status, vulnerability list, retest evidence", ("Review patch deployment status by asset and severity.", "Identify overdue critical or high remediation items.", "Check evidence of remediation validation or rescanning.")),
    ],
    "endpoint": [
        Requirement("ENDPOINT", "Endpoint and Device Security Standard", "Endpoints and devices must be securely configured, protected, monitored, and managed throughout their lifecycle.", "Endpoint Security", "Assess endpoint protection coverage.", "Endpoint inventory, agent status, encryption status", ("Review endpoint inventory and protection agent coverage.", "Identify unmanaged, non-compliant, or outdated devices.")),
    ],
    "development": [
        Requirement("SAD", "Secure Application Development Standard", "Applications must follow secure development, testing, vulnerability remediation, and release control requirements.", "System Development", "Assess secure SDLC controls.", "SDLC evidence, security test results, release approvals", ("Review secure SDLC and security testing records.", "Identify open high-risk findings at deployment.")),
    ],
    "incident": [
        Requirement("SIRM", "Security Incident Response and Management Standard", "Security incidents must be reported, triaged, escalated, investigated, and remediated.", "Incident Management", "Assess incident response effectiveness.", "Incident register, SLA evidence, RCA, corrective actions", ("Review incident register completeness and severity classification.", "Compare response and resolution timestamps against SLA expectations.", "Verify root cause, corrective action, and closure evidence.")),
        Requirement("INC", "Incident Management Standard", "IT incidents must be managed to restore normal service operation and minimize business impact.", "Incident Management", "Assess incident lifecycle operation.", "Incident tickets and closure evidence", ("Review incident categorization, assignment, resolution, and closure evidence.",)),
        Requirement("PRB", "Problem Management Standard", "Recurring or significant incidents must be analyzed through problem management to identify root cause and preventive actions.", "Problem Management", "Assess recurring incident prevention.", "Problem records and RCA evidence", ("Identify recurring incidents and verify problem records or RCA evidence.",)),
    ],
    "third-party": [
        Requirement("TPRM", "IT Third Party Risk Management Standard", "IT third-party risks must be assessed, contracted, monitored, and reviewed throughout the supplier lifecycle.", "Third Party Risk Management", "Assess third-party control lifecycle.", "Due diligence, contracts, monitoring records", ("Review third-party risk assessment and due diligence evidence.", "Check contract clauses, monitoring, and issue remediation records.")),
        Requirement("CLOUD-TP", "Cloud Security Standard", "Cloud service provider contracts, control responsibilities, certifications, and monitoring evidence must be maintained.", "Third Party Risk Management", "Assess cloud provider evidence.", "Cloud provider contract, certification, SOC report", ("Review cloud provider contract, certification, and SOC report evidence where applicable.",)),
    ],
    "project": [
        Requirement("ITPM", "IT Project Management Standard", "IT projects must be governed through approved scope, risk, schedule, deliverable, testing, and closure controls.", "IT Project Management", "Assess project governance controls.", "Project approval, risk log, status reports, test sign-off", ("Review project approval, governance, risk, and status reporting evidence.", "Check testing, implementation, sign-off, and closure artifacts.")),
        Requirement("PORT", "Portfolio Management Standard", "Portfolio governance must support prioritization, oversight, and benefit/risk visibility across initiatives.", "IT Project Management", "Assess portfolio governance.", "Portfolio prioritization and steering evidence", ("Review portfolio prioritization and steering evidence for in-scope initiatives.",)),
    ],
}


REQUIREMENT_LIBRARY: dict[str, list[Requirement]] = {
    "SCBX Group Standards": [
        Requirement("SCBX-AC-01", "SCBX Group Standards", "Access control must be appropriately managed.", "Access Control", "Ensure user access is authorized, appropriate, and removed when no longer required.", "User listings, HR active employee listing, access logs", ("Review user access appropriateness.", "Verify access removal for terminated employees.", "Identify excessive access privileges.")),
        Requirement("SCBX-AC-02", "SCBX Group Standards", "Privileged access must be approved and periodically reviewed.", "Access Control", "Ensure privileged accounts are justified, approved, and monitored.", "Privileged access list, approval evidence, periodic access review evidence", ("Identify privileged users.", "Verify approval evidence.", "Check review completeness.")),
        Requirement("SCBX-LOG-01", "SCBX Group Standards", "Security events must be logged and monitored.", "Logging", "Ensure access activities and exceptions can be traced and investigated.", "Access logs, security monitoring alerts, log retention configuration", ("Review log coverage.", "Check monitoring evidence.", "Assess retention alignment.")),
    ],
    "BOT Requirements": [
        Requirement("BOT-IT-AC-01", "BOT Requirements", "IT access rights must be controlled in line with risk and business need.", "Access Control", "Assess whether account provisioning, review, and removal are operating effectively.", "User access listing, HR records, access approval, access review evidence", ("Test terminated user access.", "Review approval evidence.", "Identify dormant or excessive access.")),
        Requirement("BOT-IT-GOV-02", "BOT Requirements", "Critical IT controls must have sufficient evidence for regulatory assessment.", "Information Security", "Confirm that evidence supports design and operating effectiveness.", "Policy documents, procedures, testing records, exception logs", ("Map evidence to requirement.", "Identify insufficient evidence.", "Summarize compliance gaps.")),
    ],
    "Internal IT Security Standards": [
        Requirement("INT-SEC-AC-01", "Internal IT Security Standards", "User accounts must be traceable to a valid employee or approved service owner.", "Access Control", "Ensure every active account has an accountable owner.", "User access listing, employee listing, service account register", ("Reconcile accounts to HR records.", "Identify stale accounts.", "Review service account ownership.")),
        Requirement("INT-SEC-AC-02", "Internal IT Security Standards", "Access changes must retain approval evidence.", "Change Management", "Ensure access granting and changes are authorized before use.", "Access approval, ticket records, authority matrix", ("Review approval completeness.", "Compare approver to authority matrix.", "Identify missing approval evidence.")),
    ],
    "Other Internal Policies / Baselines": [
        Requirement("POLICY-BASELINE-01", "Other Internal Policies / Baselines", "Controls must align with the selected internal policy or baseline.", "System Configuration", "Assess control operation against the selected policy requirement.", "Policy, procedure, configuration baseline, testing evidence", ("Decompose policy requirement.", "Map expected evidence.", "Identify control gaps.")),
    ],
}


DEMO_DATA: dict[str, list[dict[str, Any]]] = {
    "access": [
        {"id": "USR-001", "status": "active", "employment_status": "active", "approved": "yes", "last_login_days": 4},
        {"id": "USR-002", "status": "active", "employment_status": "terminated", "approved": "yes", "last_login_days": 14},
        {"id": "USR-003", "status": "active", "employment_status": "active", "approved": "pending", "last_login_days": 35},
        {"id": "USR-004", "status": "active", "employment_status": "active", "approved": "yes", "last_login_days": 122},
        {"id": "USR-009", "status": "active", "employment_status": "resigned", "approved": "no", "last_login_days": 97},
        {"id": "USR-010", "status": "active", "employment_status": "active", "approved": "yes", "last_login_days": 44},
    ],
    "configuration": [
        {"id": "CHG-001", "approved": "yes", "tested": "passed"},
        {"id": "CHG-002", "approved": "no", "tested": "passed"},
        {"id": "CHG-003", "approved": "yes", "tested": "not tested"},
        {"id": "CHG-004", "approved": "pending", "tested": "failed"},
        {"id": "CHG-005", "approved": "yes", "tested": "passed"},
    ],
    "backup": [
        {"id": "BKP-001", "status": "success", "restore_test": "passed"},
        {"id": "BKP-002", "status": "failed", "restore_test": "passed"},
        {"id": "BKP-003", "status": "success", "restore_test": "overdue"},
        {"id": "BKP-004", "status": "incomplete", "restore_test": "not tested"},
        {"id": "BKP-005", "status": "success", "restore_test": "passed"},
    ],
    "patch": [
        {"id": "VUL-001", "severity": "critical", "age_days": 45, "status": "open"},
        {"id": "VUL-002", "severity": "high", "age_days": 12, "status": "open"},
        {"id": "VUL-003", "severity": "high", "age_days": 71, "status": "open"},
        {"id": "VUL-004", "severity": "critical", "age_days": 50, "status": "closed"},
        {"id": "VUL-005", "severity": "medium", "age_days": 92, "status": "open"},
    ],
    "incident": [
        {"id": "INC-001", "sla_status": "met", "status": "closed", "rca": "complete"},
        {"id": "INC-002", "sla_status": "breached", "status": "closed", "rca": "complete"},
        {"id": "INC-003", "sla_status": "met", "status": "closed", "rca": "missing"},
        {"id": "INC-004", "sla_status": "met", "status": "open", "rca": "pending"},
        {"id": "INC-005", "sla_status": "overdue", "status": "open", "rca": "pending"},
    ],
}


def _norm(value: Any) -> str:
    if pd.isna(value):
        return ""
    return str(value).strip().lower()


def _record_value(row: pd.Series, keys: list[str]) -> str:
    lower_columns = {str(col).lower().strip(): col for col in row.index}
    for key in keys:
        if key in lower_columns:
            return _norm(row[lower_columns[key]])
    return ""


def check_access(row: pd.Series) -> list[str]:
    status = _record_value(row, ["status", "account_status"])
    employment = _record_value(row, ["employment_status", "employee_status"])
    approved = _record_value(row, ["approved", "approval_status"])
    last_login = _record_value(row, ["last_login_days", "days_since_login"])
    issues: list[str] = []
    if not status or not employment or not approved:
        issues.append("Account, employment, or approval data is incomplete")
    if employment in {"terminated", "resigned", "inactive"} and status == "active":
        issues.append("A terminated employee account remains active")
    if approved in {"no", "false", "pending", "unapproved"}:
        issues.append("Access approval evidence is missing")
    if _to_number(last_login) > 90 and status == "active":
        issues.append("The active account has been dormant for more than 90 days")
    return issues


def check_configuration(row: pd.Series) -> list[str]:
    approved = _record_value(row, ["approved", "approval_status"])
    tested = _record_value(row, ["tested", "test_status"])
    issues: list[str] = []
    if not approved or not tested:
        issues.append("Approval or testing data is incomplete")
    if approved in {"no", "false", "pending", "unapproved"}:
        issues.append("The configuration change was not approved")
    if tested in {"no", "false", "failed", "not tested"}:
        issues.append("Complete testing evidence was not provided")
    return issues


def check_backup(row: pd.Series) -> list[str]:
    status = _record_value(row, ["status", "backup_status"])
    restore = _record_value(row, ["restore_test", "restore_status"])
    issues: list[str] = []
    if not status or not restore:
        issues.append("Backup or restore-test status is incomplete")
    if status in {"failed", "error", "incomplete", "missed"}:
        issues.append("The backup job did not complete successfully")
    if restore in {"failed", "no", "not tested", "overdue"}:
        issues.append("Restore testing did not meet the approved plan")
    return issues


def check_patch(row: pd.Series) -> list[str]:
    severity = _record_value(row, ["severity", "risk"])
    age_raw = _record_value(row, ["age_days", "days_open", "overdue_days"])
    status = _record_value(row, ["status", "patch_status"])
    age = _to_number(age_raw)
    issues: list[str] = []
    if not severity or not age_raw or not status:
        issues.append("Severity, item age, or patch status is incomplete")
    if severity == "critical" and age > 30 and status != "closed":
        issues.append("Critical patch exceeded the 30-day SLA")
    if severity == "high" and age > 60 and status != "closed":
        issues.append("High patch exceeded the 60-day SLA")
    if status in {"failed", "error"}:
        issues.append("Patch deployment failed")
    return issues


def check_incident(row: pd.Series) -> list[str]:
    sla = _record_value(row, ["sla_status", "response_sla"])
    status = _record_value(row, ["status", "incident_status"])
    rca = _record_value(row, ["rca", "root_cause"])
    issues: list[str] = []
    if not sla or not status or not rca:
        issues.append("SLA, incident status, or root-cause data is incomplete")
    if sla in {"breached", "overdue", "failed"}:
        issues.append("Incident response exceeded the SLA")
    if status == "closed" and rca in {"", "no", "missing", "pending"}:
        issues.append("The incident was closed without a root cause analysis")
    return issues


RULES = {
    "access": {
        "title": "Access Control",
        "criteria": "Access must align with job responsibilities, receive appropriate approval, and be disabled promptly when employment ends.",
        "check": check_access,
    },
    "configuration": {
        "title": "System Configuration",
        "criteria": "Configuration changes must be approved, tested, and supported by an auditable record.",
        "check": check_configuration,
    },
    "backup": {
        "title": "Data Backup",
        "criteria": "Backup jobs must complete as scheduled and restoration must be tested in line with the approved plan.",
        "check": check_backup,
    },
    "patch": {
        "title": "Patch Management",
        "criteria": "Critical vulnerabilities must be remediated within 30 days and high vulnerabilities within 60 days.",
        "check": check_patch,
    },
    "incident": {
        "title": "Incident Management",
        "criteria": "Incidents must be handled within SLA and closed with a documented root cause analysis.",
        "check": check_incident,
    },
}


def _to_number(value: Any) -> float:
    try:
        return float(value)
    except Exception:
        return 0.0


def requirement_rows(requirements: list[Requirement]) -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "Reference": item.reference,
                "Source": item.source,
                "Requirement": item.requirement,
                "Audit Topic": item.topic,
                "Evidence": item.evidence,
                "Mapped Procedures": "\n".join(item.procedures),
            }
            for item in requirements
        ]
    )


def references_for(approach: str, topic_key: str, standard: str, custom_requirements: list[dict[str, Any]] | None) -> list[Requirement]:
    if custom_requirements:
        return [Requirement(**item) for item in custom_requirements]
    if approach == "Compliance-based":
        return REQUIREMENT_LIBRARY.get(standard, REQUIREMENT_LIBRARY["SCBX Group Standards"])
    return CONTROL_REFERENCES.get(topic_key, CONTROL_REFERENCES["access"])


def blueprint_markdown(approach: str, topic_key: str, standard: str, custom_requirements: list[dict[str, Any]] | None) -> str:
    topic = TOPICS.get(topic_key, TOPICS["access"])
    rule = RULES[topic.rule_key]
    requirements = references_for(approach, topic_key, standard, custom_requirements)
    blueprint = BLUEPRINTS.get(topic.rule_key, BLUEPRINTS["access"])
    procedures = []
    for req in requirements:
        for procedure in req.procedures:
            if procedure not in procedures:
                procedures.append(procedure)

    input_lines = "\n".join([f"- **{name}** ({fmt}): {detail}" for name, detail, fmt in blueprint["inputs"]])
    proc_lines = "\n".join([f"{idx}. {item}" for idx, item in enumerate(procedures, 1)])
    output_lines = "\n".join([f"- **{name}** ({fmt}): {detail}" for name, detail, fmt in blueprint["outputs"]])
    source_line = "Uploaded regulation" if custom_requirements else (standard if approach == "Compliance-based" else "SCBX Group Standards mapping")
    return f"""### Audit Blueprint

**Approach:** {approach}  
**Topic / Standard:** {topic.title if approach == "Risk-based" else standard}  
**Criteria basis:** {source_line}  
**Testing rule:** {rule["criteria"]}

#### Required Inputs
{input_lines}

#### Audit Procedures
{proc_lines}

#### Expected Outputs
{output_lines}
"""


def read_table(file_obj: Any) -> pd.DataFrame:
    if file_obj is None:
        return pd.DataFrame()
    path = Path(getattr(file_obj, "name", file_obj))
    suffix = path.suffix.lower()
    if suffix in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    if suffix == ".json":
        return pd.read_json(path)
    if suffix in {".csv", ".txt", ".log"}:
        return pd.read_csv(path)
    raise gr.Error("Evidence file must be CSV, XLSX, XLS, JSON, TXT, or LOG with tabular columns.")


def extract_text(file_obj: Any) -> tuple[str, str]:
    if file_obj is None:
        return "", ""
    path = Path(getattr(file_obj, "name", file_obj))
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        text = ""
        if pdfplumber:
            with pdfplumber.open(path) as pdf:
                text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        elif PdfReader:
            reader = PdfReader(str(path))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        else:
            raise gr.Error("PDF parsing requires pdfplumber or pypdf.")
        return path.name, text
    if suffix in {".txt", ".md", ".csv", ".log"}:
        return path.name, path.read_text(encoding="utf-8", errors="ignore")
    if suffix in {".xlsx", ".xls"}:
        df = pd.read_excel(path)
        return path.name, df.to_csv(index=False)
    raise gr.Error("Regulation file must be PDF, TXT, MD, CSV, LOG, XLSX, or XLS.")


def extract_custom_requirements(file_obj: Any, topic_key: str) -> tuple[list[dict[str, Any]], pd.DataFrame, str]:
    if file_obj is None:
        return [], pd.DataFrame(), "No uploaded regulation. The selected standard library will be used."
    file_name, text = extract_text(file_obj)
    source = f"Uploaded Regulation: {file_name}"
    selected_topic = TOPICS.get(topic_key, TOPICS["access"]).title
    keyword_pattern = re.compile(
        r"(must|shall|required|requirement|policy|standard|control|ensure|review|approve|monitor|retain|ต้อง|ควร|ให้|กำหนด|ควบคุม|อนุมัติ|ติดตาม|จัดเก็บ)",
        re.I,
    )
    numbered_pattern = re.compile(r"^(\d+(\.\d+)*|[a-z]\)|\([a-z]\)|[-*])\s+", re.I)
    lines = [
        re.sub(r"\s+", " ", line).strip()
        for line in text.replace("\r", "\n").split("\n")
    ]
    candidates = [
        numbered_pattern.sub("", line).strip()
        for line in lines
        if 24 <= len(line) <= 320 and (keyword_pattern.search(line) or numbered_pattern.search(line))
    ]
    if not candidates:
        candidates = [
            sentence.strip()
            for sentence in re.split(r"(?<=[.!?。])\s+", re.sub(r"\s+", " ", text))
            if 30 <= len(sentence.strip()) <= 320 and keyword_pattern.search(sentence)
        ]
    if not candidates:
        candidates = [
            "Uploaded regulation must be mapped to relevant controls and supporting audit evidence.",
            "Compliance evidence must be sufficient to demonstrate control design and operating effectiveness.",
            "Exceptions must be documented when evidence is missing, incomplete, or not aligned with the regulation.",
        ]

    seen: set[str] = set()
    requirements: list[dict[str, Any]] = []
    for item in candidates:
        key = item.lower()
        if key in seen:
            continue
        seen.add(key)
        idx = len(requirements) + 1
        requirements.append(
            {
                "reference": f"CUSTOM-REG-{idx:02d}",
                "source": source,
                "requirement": item[:500],
                "topic": selected_topic,
                "objective": "Assess compliance against a user-uploaded regulation or standard.",
                "evidence": "Uploaded regulation, control evidence, system reports, approval records",
                "procedures": (
                    "Map uploaded requirement to expected control and evidence",
                    "Review evidence against uploaded requirement",
                    "Document compliance gaps or insufficient evidence",
                ),
            }
        )
        if len(requirements) >= 12:
            break

    status = f"Loaded **{file_name}** and extracted **{len(requirements)}** assessable requirements."
    return requirements, requirement_rows([Requirement(**item) for item in requirements]), status


def load_evidence(file_obj: Any, topic_key: str, use_demo: bool) -> tuple[pd.DataFrame, str]:
    topic = TOPICS.get(topic_key, TOPICS["access"])
    if use_demo:
        df = pd.DataFrame(DEMO_DATA[topic.rule_key])
        return df, f"Loaded demo data for {topic.title}: {len(df):,} records."
    df = read_table(file_obj)
    if df.empty:
        raise gr.Error("Please upload evidence data or tick Use demo data.")
    return df, f"Loaded evidence file: {len(df):,} records, {len(df.columns):,} columns."


def identify_reference(row: pd.Series, index: int) -> str:
    for key in ["id", "user_id", "asset_id", "ticket_id", "change_id", "incident_id", "vulnerability_id"]:
        value = _record_value(row, [key])
        if value:
            return str(row[[col for col in row.index if str(col).lower().strip() == key][0]])
    return f"REC-{index + 1:03d}"


def analyze(
    approach: str,
    topic_key: str,
    standard: str,
    regulation_file: Any,
    evidence_file: Any,
    use_demo: bool,
) -> tuple[str, pd.DataFrame, pd.DataFrame, str, str, str, str, str, list[dict[str, Any]]]:
    custom_requirements, custom_df, reg_status = extract_custom_requirements(regulation_file, topic_key)
    evidence_df, evidence_status = load_evidence(evidence_file, topic_key, use_demo)
    topic = TOPICS.get(topic_key, TOPICS["access"])
    rule = RULES[topic.rule_key]
    requirements = references_for(approach, topic_key, standard, custom_requirements)
    criteria_reference = "; ".join(item.reference for item in requirements)
    exceptions: list[dict[str, Any]] = []

    for index, row in evidence_df.iterrows():
        issues = rule["check"](row)
        if not issues:
            continue
        issue_text = "; ".join(issues)
        exceptions.append(
            {
                "Row": index + 1,
                "Reference": identify_reference(row, index),
                "Criteria Reference": criteria_reference,
                "Issue": issue_text,
                "Risk": "High" if re.search(r"critical|terminated|failed|breached|overdue", issue_text, re.I) else "Medium",
            }
        )

    total = len(evidence_df)
    exception_count = len(exceptions)
    passed = total - exception_count
    pass_rate = round((passed / total) * 100) if total else 0
    framework = Path(getattr(regulation_file, "name", "")).name if custom_requirements else (standard if approach == "Compliance-based" else "SCBX Group Standards")
    summary = f"""### Executive Summary

| Metric | Value |
|---|---:|
| Total Records | {total:,} |
| Passed Records | {passed:,} |
| Exception Records | {exception_count:,} |
| Pass Rate | {pass_rate}% |

{reg_status}  
{evidence_status}
"""

    exceptions_df = pd.DataFrame(exceptions)
    matrix_df = build_compliance_matrix(exceptions_df, requirements, framework, rule["title"])
    narrative = build_narrative(total, passed, exception_count, pass_rate, rule["title"], rule["criteria"], framework, approach)
    references_df = requirement_rows(requirements)
    report_path, exception_path, matrix_path = write_exports(
        approach=approach,
        topic_or_standard=framework if approach == "Compliance-based" else topic.title,
        summary={"total": total, "passed": passed, "exceptions": exception_count, "pass_rate": pass_rate},
        references=references_df,
        exceptions=exceptions_df,
        matrix=matrix_df,
        narrative=narrative,
        criteria=rule["criteria"],
    )
    return (
        summary,
        exceptions_df,
        matrix_df,
        narrative,
        str(report_path),
        str(exception_path) if exception_path else None,
        str(matrix_path) if matrix_path else None,
        blueprint_markdown(approach, topic_key, standard, custom_requirements),
        custom_requirements,
    )


def build_compliance_matrix(exceptions_df: pd.DataFrame, requirements: list[Requirement], framework: str, fallback_topic: str) -> pd.DataFrame:
    issues = " ".join(exceptions_df["Issue"].astype(str).tolist()) if not exceptions_df.empty else ""
    has_terminated = bool(re.search(r"terminated|resigned", issues, re.I))
    has_approval = bool(re.search(r"approval|privilege|excessive", issues, re.I))
    has_dormant = bool(re.search(r"dormant|inactive|stale", issues, re.I))
    rows = []
    for index, requirement in enumerate(requirements):
        gap_signals = [
            "terminated user access was identified" if has_terminated else "",
            "approval or privilege evidence was incomplete" if has_approval else "",
            "inactive or stale access was identified" if has_dormant else "",
        ]
        gap_signals = [item for item in gap_signals if item]
        if exceptions_df.empty:
            status = "Compliant"
            gap = "No exception noted from the evidence population."
        elif index == 0:
            status = "Partially Compliant"
            gap = f"{framework} requirement needs follow-up because {', '.join(gap_signals) or 'supporting evidence was not complete'}."
        elif len(gap_signals) > 1:
            status = "Non-Compliant"
            gap = f"{framework} requirement needs follow-up because {', '.join(gap_signals)}."
        else:
            status = "Insufficient Evidence"
            gap = f"{framework} requirement needs follow-up because supporting evidence was not complete."
        rows.append(
            {
                "Reference": requirement.reference,
                "Source": requirement.source,
                "Requirement": requirement.requirement,
                "Audit Topic": requirement.topic or fallback_topic,
                "Evidence": requirement.evidence,
                "Status": status,
                "Gap / Observation": gap,
            }
        )
    return pd.DataFrame(rows)


def build_narrative(total: int, passed: int, exception_count: int, pass_rate: int, topic: str, criteria: str, framework: str, approach: str) -> str:
    if not total:
        return "There is insufficient evidence to draft an audit finding. Import the relevant records before running the analysis."
    if approach == "Compliance-based":
        return (
            f"The assessment of {framework} covered {total:,} evidence records mapped to {topic}. "
            f"Based on the available evidence, {passed:,} records met the control criteria and {exception_count:,} records indicated compliance gaps or insufficient control performance. "
            "Condition: exceptions were identified in the submitted evidence population. "
            f"Criteria: {criteria} "
            "Cause: the exceptions may have resulted from incomplete monitoring, approval retention, or control-review procedures. "
            "Effect: this increases the risk of non-compliance, unauthorized activity, service disruption, or incomplete management oversight. "
            "The draft conclusion is subject to auditor review, evidence validation, and management confirmation before finalization."
        )
    return (
        f"We reviewed {total:,} {topic} records and found that {passed:,} records met the criteria, while {exception_count:,} exceptions were identified, resulting in a {pass_rate}% pass rate. "
        f"The exceptions were not aligned with {framework}, which requires that {criteria.lower()} "
        "The condition may have resulted from incomplete monitoring and control-review procedures. "
        "This increases the risk of unauthorized access, service disruption, or non-compliance with applicable requirements. "
        "Management should remediate the identified exceptions and strengthen ongoing monitoring."
    )


def _safe_part(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9ก-๙_-]+", "_", value).strip("_")[:60] or "assessment"


def write_exports(
    approach: str,
    topic_or_standard: str,
    summary: dict[str, int],
    references: pd.DataFrame,
    exceptions: pd.DataFrame,
    matrix: pd.DataFrame,
    narrative: str,
    criteria: str,
) -> tuple[Path, Path | None, Path | None]:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base = _safe_part(topic_or_standard)
    report_path = EXPORT_DIR / f"SCBX_Audit_Workpaper_{base}_{stamp}.txt"
    exception_path = EXPORT_DIR / f"SCBX_Exception_Register_{base}_{stamp}.csv" if not exceptions.empty else None
    matrix_path = EXPORT_DIR / f"SCBX_Compliance_Matrix_{base}_{stamp}.csv" if not matrix.empty else None

    report_path.write_text(
        "\n".join(
            [
                "SCBX IT AUDIT WORKPAPER DRAFT",
                "",
                f"Mode: {approach}",
                f"Topic / Standard: {topic_or_standard}",
                f"Total Records: {summary['total']}",
                f"Passed: {summary['passed']}",
                f"Exceptions: {summary['exceptions']}",
                f"Pass Rate: {summary['pass_rate']}%",
                "",
                "TESTING REFERENCES",
                references.to_csv(index=False),
                "",
                "CRITERIA",
                criteria,
                "",
                "AUDITOR NARRATIVE",
                narrative,
                "",
                "EXCEPTIONS",
                exceptions.to_csv(index=False) if not exceptions.empty else "No exceptions identified.",
                "",
                "COMPLIANCE MATRIX",
                matrix.to_csv(index=False) if not matrix.empty else "No compliance matrix generated.",
                "",
                "HUMAN REVIEW NOTE",
                "This is a draft generated for auditor review, challenge, override, and finalization.",
            ]
        ),
        encoding="utf-8-sig",
    )
    if exception_path:
        exceptions.to_csv(exception_path, index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)
    if matrix_path:
        matrix.to_csv(matrix_path, index=False, encoding="utf-8-sig", quoting=csv.QUOTE_ALL)
    return report_path, exception_path, matrix_path


def preview_context(approach: str, topic_key: str, standard: str, regulation_file: Any) -> tuple[str, pd.DataFrame, list[dict[str, Any]]]:
    custom_requirements, custom_df, _ = extract_custom_requirements(regulation_file, topic_key) if regulation_file else ([], pd.DataFrame(), "")
    requirements = references_for(approach, topic_key, standard, custom_requirements)
    return blueprint_markdown(approach, topic_key, standard, custom_requirements), requirement_rows(requirements), custom_requirements


def save_session_json(approach: str, topic_key: str, standard: str, custom_requirements: list[dict[str, Any]] | None) -> str:
    path = EXPORT_DIR / f"SCBX_Audit_Session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    path.write_text(
        json.dumps(
            {
                "approach": approach,
                "topic": topic_key,
                "standard": standard,
                "custom_requirements": custom_requirements or [],
                "saved_at": datetime.now().isoformat(),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return str(path)


CSS = """
.gradio-container { max-width: 1240px !important; }
.hero { padding: 22px 26px; border-radius: 22px; background: linear-gradient(135deg,#151922,#283245); color: white; }
.hero h1 { margin: 0 0 8px; font-size: 30px; }
.hero p { margin: 0; opacity: .82; }
"""


def build_app() -> gr.Blocks:
    with gr.Blocks(title=APP_TITLE, css=CSS, theme=gr.themes.Soft(primary_hue="slate", secondary_hue="orange")) as demo:
        custom_state = gr.State([])
        gr.HTML(
            """
            <div class="hero">
              <h1>SCBX IT Audit Intelligence</h1>
              <p>Local Gradio production workspace for risk-based audit, compliance assessment, uploaded regulations, evidence testing, and workpaper generation.</p>
            </div>
            """
        )
        with gr.Row():
            approach = gr.Radio(["Risk-based", "Compliance-based"], value="Risk-based", label="Audit Approach")
            topic = gr.Dropdown([(item.title, key) for key, item in TOPICS.items()], value="access", label="Audit Topic")
            standard = gr.Dropdown(list(REQUIREMENT_LIBRARY.keys()), value="SCBX Group Standards", label="Compliance Standard")
        regulation_file = gr.File(label="Upload regulation / standard (PDF, TXT, MD, CSV, LOG, XLSX)", file_types=[".pdf", ".txt", ".md", ".csv", ".log", ".xlsx", ".xls"])
        with gr.Row():
            preview_btn = gr.Button("Preview blueprint and references", variant="secondary")
            save_session_btn = gr.Button("Save session JSON", variant="secondary")
        with gr.Tabs():
            with gr.Tab("1. Blueprint"):
                blueprint = gr.Markdown()
                references = gr.Dataframe(label="Testing References / Requirement Mapping", interactive=False, wrap=True)
            with gr.Tab("2. Evidence Testing"):
                with gr.Row():
                    evidence_file = gr.File(label="Upload evidence data (CSV/XLSX/JSON/TXT)", file_types=[".csv", ".xlsx", ".xls", ".json", ".txt", ".log"])
                    use_demo = gr.Checkbox(label="Use demo evidence data", value=True)
                run_btn = gr.Button("Run assessment", variant="primary")
                summary = gr.Markdown()
                exceptions = gr.Dataframe(label="Exception Details", interactive=False, wrap=True)
                matrix = gr.Dataframe(label="Compliance Matrix", interactive=False, wrap=True)
            with gr.Tab("3. Workpaper Outputs"):
                narrative = gr.Textbox(label="Auditor Narrative", lines=9)
                with gr.Row():
                    report_file = gr.File(label="Download workpaper")
                    exception_file = gr.File(label="Download exception register")
                    matrix_file = gr.File(label="Download compliance matrix")
                session_file = gr.File(label="Download saved session")

        demo.load(preview_context, inputs=[approach, topic, standard, regulation_file], outputs=[blueprint, references, custom_state])
        preview_btn.click(preview_context, inputs=[approach, topic, standard, regulation_file], outputs=[blueprint, references, custom_state])
        run_btn.click(
            analyze,
            inputs=[approach, topic, standard, regulation_file, evidence_file, use_demo],
            outputs=[summary, exceptions, matrix, narrative, report_file, exception_file, matrix_file, blueprint, custom_state],
        )
        save_session_btn.click(save_session_json, inputs=[approach, topic, standard, custom_state], outputs=session_file)
    return demo


if __name__ == "__main__":
    build_app().queue(default_concurrency_limit=4).launch(
        server_name="127.0.0.1",
        server_port=7860,
        show_api=False,
        inbrowser=True,
    )
