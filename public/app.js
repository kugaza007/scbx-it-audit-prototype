import { buildExceptionCsv } from "./audit-export.js?v=20260618-2";

const catalog = {
  risk: {
    label: "Risk-based",
    kicker: "RISK-BASED APPROACH",
    title: "Select Audit Topic",
    description: "Choose the audit topic you would like to assess.",
    items: [
      { id: "governance", topic: "configuration", icon: "G", title: "IT Governance", description: "Review IT governance, accountability, and oversight practices." },
      { id: "risk-management", topic: "configuration", icon: "R", title: "IT Risk Management", description: "Assess risk identification, assessment, treatment, and monitoring." },
      { id: "asset", topic: "configuration", icon: "A", title: "IT Asset Management", description: "Verify completeness and ownership of technology assets." },
      { id: "security", topic: "access", icon: "S", title: "Information Security", description: "Assess the security control environment across key domains." },
      { id: "access", icon: "◎", title: "Access Control", description: "Assess the user access lifecycle and the risk of unauthorized access." },
      { id: "physical", topic: "access", icon: "P", title: "Physical and Environmental Security", description: "Review physical access, environmental safeguards, and monitoring." },
      { id: "communications", topic: "configuration", icon: "C", title: "Communications Security", description: "Assess network security, transmission controls, and connectivity risk." },
      { id: "change", topic: "configuration", icon: "C", title: "Change Management", description: "Review approvals, testing, and deployment controls for changes." },
      { id: "configuration", icon: "⌘", title: "System Configuration", description: "Review configuration changes and secure baseline controls." },
      { id: "patch", icon: "⬡", title: "Patch Management", description: "Track vulnerabilities and patch deployment against risk-based SLAs." },
      { id: "logging", topic: "incident", icon: "L", title: "Logging", description: "Assess log coverage, retention, and monitoring readiness." },
      { id: "capacity", topic: "backup", icon: "C", title: "Capacity Management", description: "Assess capacity monitoring, thresholds, and service continuity risk." },
      { id: "monitoring", topic: "incident", icon: "M", title: "Security Monitoring", description: "Review alert monitoring, triage, and escalation controls." },
      { id: "vulnerability", topic: "patch", icon: "V", title: "Vulnerability Management and Penetration Test", description: "Assess vulnerability identification, remediation, and retesting." },
      { id: "backup", icon: "↻", title: "Data Backup", description: "Confirm backup reliability and the ability to restore critical data." },
      { id: "endpoint", topic: "patch", icon: "E", title: "Endpoint Security", description: "Assess endpoint protection and hardening controls." },
      { id: "development", topic: "configuration", icon: "D", title: "System Acquisition and Development", description: "Review SDLC, testing, and secure development controls." },
      { id: "incident", icon: "!", title: "Incident Management", description: "Assess incident response, escalation, and lessons learned." },
      { id: "third-party", topic: "incident", icon: "T", title: "Third Party Risk Management", description: "Assess outsourced service and vendor technology risk controls." },
      { id: "project", topic: "configuration", icon: "J", title: "IT Project Management", description: "Review project governance, delivery risk, and implementation controls." },
    ],
  },
  compliance: {
    label: "Compliance-based",
    kicker: "COMPLIANCE-BASED APPROACH",
    title: "Select Regulation / Standard",
    description: "Choose the regulation, internal standard, or policy requirement to assess.",
    items: [
      { id: "scbx", topic: "access", icon: "S", title: "SCBX Group Standards", description: "Internal standards for technology risk, cybersecurity, and data governance." },
      { id: "bot", topic: "access", icon: "B", title: "BOT Requirements", description: "BOT regulatory requirements such as IT risk governance and control expectations." },
      { id: "internal-security", topic: "access", icon: "I", title: "Internal IT Security Standards", description: "Internal security baseline and control requirements." },
      { id: "other-policy", topic: "configuration", icon: "O", title: "Other Internal Policies / Baselines", description: "Policy, procedure, and baseline requirements selected by the auditor." },
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

const controlReferences = {
  governance: [
    { source: "Technology Risk Management Standard", file: "SCBX-Group_Technology-Risk-Management-Standard-2.pdf", reference: "TRM-GOV", requirement: "Technology risk governance, roles, control oversight, and reporting must be established and maintained.", procedures: ["Review technology risk governance structure and assigned ownership.", "Verify risk reporting, committee oversight, and evidence of management review.", "Check exceptions or waivers are assessed, approved, and tracked."] },
    { source: "Cybersecurity and Technology Risk Awareness Standard", file: "SCBX-Group_Cybersecurity-and-Technology-Risk-Awareness-Standard-1.pdf", reference: "CTRA-AWARE", requirement: "Personnel must receive awareness and training relevant to cybersecurity and technology risk responsibilities.", procedures: ["Review training scope, target population, and completion evidence.", "Identify overdue or missing awareness completion for in-scope users."] },
  ],
  "risk-management": [
    { source: "Technology Risk Management Standard", file: "SCBX-Group_Technology-Risk-Management-Standard-2.pdf", reference: "TRM-RISK", requirement: "Technology risks must be identified, assessed, monitored, and reported in line with assigned risk exposure tier.", procedures: ["Review technology risk assessment records and risk treatment plans.", "Validate status of risk actions and overdue remediation items.", "Check risk acceptance or waiver approvals and review frequency."] },
  ],
  asset: [
    { source: "IT Asset Management Standard", file: "SCBX-Group_IT-Asset-Management-Standard.pdf", reference: "ITAM", requirement: "IT assets must be inventoried, owned, classified, maintained, and controlled throughout the asset lifecycle.", procedures: ["Reconcile asset inventory with source systems and ownership records.", "Review missing owner, status, classification, or lifecycle information.", "Check asset disposal or transfer evidence for completeness."] },
  ],
  security: [
    { source: "Data Security and Encryption Standard", file: "SCBX-Group_Data-Security-and-Encryption-Standard-1.pdf", reference: "DSE", requirement: "Sensitive data must be protected according to classification, encryption, transmission, and handling requirements.", procedures: ["Review data classification and encryption evidence for in-scope systems.", "Check whether sensitive data storage and transmission controls are documented.", "Identify missing evidence for encryption, masking, or data handling controls."] },
    { source: "Network Security Standard", file: "SCBX-Group_Network-Security-Standard-1.pdf", reference: "NETSEC", requirement: "Network security controls must restrict, monitor, and protect connectivity according to approved architecture.", procedures: ["Review network segmentation and firewall rule evidence.", "Identify overly permissive connectivity or missing rule owner information."] },
  ],
  access: [
    { source: "Identity and Access Management Standard", file: "SCBX-Group_Identity-and-Access-Management-Standard_v1.0.pdf", reference: "IAM", requirement: "User and privileged access must be requested, approved, reviewed, and removed in line with the access lifecycle.", procedures: ["Reconcile active accounts against HR employee status.", "Verify access request and approval evidence for sampled users.", "Identify terminated, dormant, privileged, or unapproved accounts.", "Check periodic access review evidence and follow-up actions."] },
    { source: "Cloud Security Standard", file: "SCBX-Group_Cloud-Security-Standard.pdf", reference: "CLOUD-AC", requirement: "Cloud portal, administrative, and provider access must follow least privilege, MFA, and periodic entitlement review requirements.", procedures: ["Review cloud administrative access and MFA evidence.", "Verify entitlement review evidence for provider or cloud system users."] },
  ],
  physical: [
    { source: "Physical and Environmental Security Standard", file: "SCBX-Group_Physical-and-Environmental-Security-Standard.pdf", reference: "PES", requirement: "Physical facilities and environmental controls must protect technology areas from unauthorized access, damage, or service disruption.", procedures: ["Review physical access list and authorization evidence for restricted areas.", "Check visitor, badge, CCTV, and environmental monitoring evidence.", "Identify terminated users or vendors with active facility access."] },
  ],
  communications: [
    { source: "Network Security Standard", file: "SCBX-Group_Network-Security-Standard-1.pdf", reference: "NETSEC", requirement: "Network communication paths must be controlled through approved architecture, segmentation, firewall, and secure connectivity controls.", procedures: ["Review approved network diagrams and firewall rule baselines.", "Identify open, unused, or unauthorized network rules.", "Check remote access and encrypted channel requirements."] },
  ],
  change: [
    { source: "Change Management Standard", file: "SCBX-Change-Management-Standard.pdf", reference: "CHG", requirement: "Changes must be recorded, assessed, approved, tested, implemented, and reviewed according to change governance.", procedures: ["Reconcile change tickets with deployment or release evidence.", "Verify risk assessment, approval, testing, and rollback evidence.", "Identify emergency or failed changes without post-implementation review."] },
    { source: "Release and Deployment Management Standard", file: "SCBX-Release-and-Deployment-Management-Standard-1.pdf", reference: "REL", requirement: "Release and deployment activities must be planned, authorized, tested, and supported by implementation evidence.", procedures: ["Review release package completeness and deployment approval.", "Check deployment result, rollback, and communication evidence."] },
  ],
  configuration: [
    { source: "Configuration Management Standard", file: "SCBX-Configuration-Management-Standard.pdf", reference: "CFG", requirement: "Configuration items and baselines must be identified, controlled, recorded, and maintained.", procedures: ["Compare configuration records against approved baseline requirements.", "Identify unsupported baseline deviations or missing configuration ownership.", "Review evidence of configuration updates and review cadence."] },
    { source: "Cloud Architecture Standard", file: "SCBX-Group_Cloud-Architecture-Standard.pdf", reference: "CLOUD-ARCH", requirement: "Cloud architecture must align with approved design, control, resilience, and governance requirements.", procedures: ["Review cloud architecture approval and design evidence.", "Check deviations from approved architecture or landing-zone standards."] },
  ],
  logging: [
    { source: "Logging and Auditing Standard", file: "SCBX-Group_Logging-and-Auditing-Standard-1.pdf", reference: "LOG", requirement: "Security and system logs must be generated, retained, protected, monitored, and available for investigation.", procedures: ["Review log source coverage and integration with centralized logging.", "Check log retention, protection, and review evidence.", "Identify critical systems without required logging or monitoring."] },
  ],
  capacity: [
    { source: "Capacity Management Standard", file: "SCBX-Capacity-Management-Standard.pdf", reference: "CAP", requirement: "Capacity and performance must be monitored, analyzed, forecasted, and planned to meet current and future service demand.", procedures: ["Review capacity monitoring metrics and service performance thresholds.", "Check capacity plans, forecasts, and approval evidence.", "Identify services with repeated threshold breaches or missing capacity plan."] },
  ],
  monitoring: [
    { source: "Logging and Auditing Standard", file: "SCBX-Group_Logging-and-Auditing-Standard-1.pdf", reference: "LOG-MON", requirement: "Events and logs must support monitoring, detection, and investigation of security or operational incidents.", procedures: ["Review alert rules, monitoring coverage, and escalation evidence.", "Identify critical events without alerting, triage, or investigation evidence."] },
    { source: "Security Incident Response and Management Standard", file: "SCBX-Group_Security-Incident-Response-and-Management-Standard-1.pdf", reference: "SIRM", requirement: "Security incidents must be detected, reported, escalated, investigated, and closed with appropriate actions.", procedures: ["Sample alerts and verify incident escalation and closure evidence."] },
  ],
  vulnerability: [
    { source: "Security Remediation and Patch Management Standard", file: "SCBX-Group_Security-Remediation-and-Patch-Management-Standard.pdf", reference: "SRPM", requirement: "Vulnerabilities must be identified, prioritized, remediated, verified, and tracked to closure.", procedures: ["Reconcile vulnerability scan results with remediation status.", "Calculate aging against severity-based remediation expectations.", "Identify overdue vulnerabilities and failed remediation evidence."] },
  ],
  backup: [
    { source: "Cloud Security Standard", file: "SCBX-Group_Cloud-Security-Standard.pdf", reference: "CLOUD-AVAIL", requirement: "Backup copies, recovery procedures, backup access governance, restoration logs, and encryption must be maintained for protected data.", procedures: ["Review backup job status and failed or missed backup evidence.", "Verify backup encryption, access controls, and recovery procedure evidence.", "Check restoration logs and restore-test results for sampled systems."] },
    { source: "Capacity Management Standard", file: "SCBX-Capacity-Management-Standard.pdf", reference: "CAP-DR", requirement: "Disaster recovery must be adopted where required to support business continuity and reduce service disruption risk.", procedures: ["Review DR or recovery planning linkage for critical services."] },
  ],
  patch: [
    { source: "Security Remediation and Patch Management Standard", file: "SCBX-Group_Security-Remediation-and-Patch-Management-Standard.pdf", reference: "SRPM", requirement: "Security patches and remediation must be prioritized, implemented, verified, and monitored based on risk.", procedures: ["Review patch deployment status by asset and severity.", "Identify overdue critical or high remediation items.", "Check evidence of remediation validation or rescanning."] },
  ],
  endpoint: [
    { source: "Endpoint and Device Security Standard", file: "SCBX-Group_Endpoint-and-Device-Security-Standard-1.pdf", reference: "ENDPOINT", requirement: "Endpoints and devices must be securely configured, protected, monitored, and managed throughout their lifecycle.", procedures: ["Review endpoint inventory and protection agent coverage.", "Identify unmanaged, non-compliant, or outdated devices.", "Check endpoint encryption, anti-malware, and configuration compliance evidence."] },
  ],
  development: [
    { source: "Secure Application Development Standard", file: "SCBX-Group_Secure-Application-Development-Standard.pdf", reference: "SAD", requirement: "Applications must follow secure development, testing, vulnerability remediation, and release control requirements.", procedures: ["Review secure SDLC evidence, security testing, and remediation records.", "Check code review, vulnerability scan, and approval evidence before release.", "Identify open high-risk findings at deployment."] },
  ],
  incident: [
    { source: "Security Incident Response and Management Standard", file: "SCBX-Group_Security-Incident-Response-and-Management-Standard-1.pdf", reference: "SIRM", requirement: "Security incidents must be reported, triaged, escalated, investigated, and remediated.", procedures: ["Review incident register completeness and severity classification.", "Compare response and resolution timestamps against SLA expectations.", "Verify root cause, corrective action, and closure evidence."] },
    { source: "Incident Management Standard", file: "SCBX-Incident-Management-standard-1.pdf", reference: "INC", requirement: "IT incidents must be managed to restore normal service operation and minimize business impact.", procedures: ["Review incident categorization, assignment, resolution, and closure evidence."] },
    { source: "Problem Management Standard", file: "SCBX-Problem-Management-Standard-1.pdf", reference: "PRB", requirement: "Recurring or significant incidents must be analyzed through problem management to identify root cause and preventive actions.", procedures: ["Identify recurring incidents and verify problem records or RCA evidence."] },
  ],
  "third-party": [
    { source: "IT Third Party Risk Management Standard", file: "SCBX-Group_IT-Third-Party-Risk-Management-Standard-1.pdf", reference: "TPRM", requirement: "IT third-party risks must be assessed, contracted, monitored, and reviewed throughout the supplier lifecycle.", procedures: ["Review third-party risk assessment and due diligence evidence.", "Check contract clauses, ongoing monitoring, and issue remediation records.", "Identify vendors missing risk profile, review, or security evidence."] },
    { source: "Cloud Security Standard", file: "SCBX-Group_Cloud-Security-Standard.pdf", reference: "CLOUD-TP", requirement: "Cloud service provider contracts, control responsibilities, certifications, and monitoring evidence must be maintained.", procedures: ["Review cloud provider contract, certification, and SOC report evidence where applicable."] },
  ],
  project: [
    { source: "IT Project Management Standard", file: "SCBX-Group_IT_Project_Management_Standard-2.pdf", reference: "ITPM", requirement: "IT projects must be governed through approved scope, risk, schedule, deliverable, testing, and closure controls.", procedures: ["Review project approval, governance, risk, and status reporting evidence.", "Check testing, implementation, sign-off, and closure artifacts.", "Identify overdue milestones or missing approval gates."] },
    { source: "Portfolio Management Standard", file: "SCBX-Portfolio-Management-Standard-1.pdf", reference: "PORT", requirement: "Portfolio governance must support prioritization, oversight, and benefit/risk visibility across initiatives.", procedures: ["Review portfolio prioritization and steering evidence for in-scope initiatives."] },
  ],
};

const requirementLibrary = {
  scbx: [
    {
      requirement: "Access control must be appropriately managed",
      reference: "SCBX-AC-01",
      source: "SCBX Group Standards",
      topic: "Access Control",
      objective: "Ensure user access is authorized, appropriate, and removed when no longer required.",
      evidence: "User listings, HR active employee listing, access logs",
      procedures: ["Review user access appropriateness", "Verify access removal for terminated employees", "Identify excessive access privileges"],
    },
    {
      requirement: "Privileged access must be approved and periodically reviewed",
      reference: "SCBX-AC-02",
      source: "SCBX Group Standards",
      topic: "Access Control",
      objective: "Ensure privileged accounts are justified, approved, and monitored.",
      evidence: "Privileged access list, approval evidence, periodic access review evidence",
      procedures: ["Identify privileged users", "Verify approval evidence", "Check review completeness"],
    },
    {
      requirement: "Security events must be logged and monitored",
      reference: "SCBX-LOG-01",
      source: "SCBX Group Standards",
      topic: "Logging",
      objective: "Ensure access activities and exceptions can be traced and investigated.",
      evidence: "Access logs, security monitoring alerts, log retention configuration",
      procedures: ["Review log coverage", "Check monitoring evidence", "Assess retention alignment"],
    },
  ],
  bot: [
    {
      requirement: "IT access rights must be controlled in line with risk and business need",
      reference: "BOT-IT-AC-01",
      source: "BOT Requirements",
      topic: "Access Control",
      objective: "Assess whether account provisioning, review, and removal are operating effectively.",
      evidence: "User access listing, HR records, access approval, access review evidence",
      procedures: ["Test terminated user access", "Review approval evidence", "Identify dormant or excessive access"],
    },
    {
      requirement: "Critical IT controls must have sufficient evidence for regulatory assessment",
      reference: "BOT-IT-GOV-02",
      source: "BOT Requirements",
      topic: "Information Security",
      objective: "Confirm that evidence supports control design and operating effectiveness.",
      evidence: "Policy documents, procedures, testing records, exception logs",
      procedures: ["Map evidence to requirement", "Identify insufficient evidence", "Summarize compliance gaps"],
    },
  ],
  "internal-security": [
    {
      requirement: "User accounts must be traceable to a valid employee or approved service owner",
      reference: "INT-SEC-AC-01",
      source: "Internal IT Security Standards",
      topic: "Access Control",
      objective: "Ensure every active account has an accountable owner.",
      evidence: "User access listing, employee listing, service account register",
      procedures: ["Reconcile accounts to HR records", "Identify stale accounts", "Review service account ownership"],
    },
    {
      requirement: "Access changes must retain approval evidence",
      reference: "INT-SEC-AC-02",
      source: "Internal IT Security Standards",
      topic: "Change Management",
      objective: "Ensure access granting and changes are authorized before use.",
      evidence: "Access approval, ticket records, authority matrix",
      procedures: ["Review approval completeness", "Compare approver to authority matrix", "Identify missing approval evidence"],
    },
  ],
  "other-policy": [
    {
      requirement: "Controls must align with the selected internal policy or baseline",
      reference: "POLICY-BASELINE-01",
      source: "Other Internal Policies / Baselines",
      topic: "System Configuration",
      objective: "Assess control operation against the selected policy requirement.",
      evidence: "Policy, procedure, configuration baseline, testing evidence",
      procedures: ["Decompose policy requirement", "Map expected evidence", "Identify control gaps"],
    },
  ],
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
  const references = getActiveReferences(topic);
  const criteriaReference = references.map((item) => item.reference).join("; ");
  const exceptions = [];
  records.forEach((record, index) => {
    const issues = rule.check(record);
    if (!issues.length) return;
    exceptions.push({
      row: index + 1,
      reference: record.id || record.user_id || record.asset_id || record.ticket_id || `REC-${String(index + 1).padStart(3, "0")}`,
      criteriaReference,
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
  const complianceMatrix = state.approach === "compliance" ? buildComplianceMatrix(exceptions, rule, framework) : [];
  const narrative = total
    ? state.approach === "compliance"
      ? `The assessment of ${framework} covered ${total.toLocaleString("en-US")} evidence records mapped to ${rule.title}. Based on the available evidence, ${passed.toLocaleString("en-US")} records met the control criteria and ${exceptionCount.toLocaleString("en-US")} records indicated compliance gaps or insufficient control performance. The draft conclusion is subject to auditor review, evidence validation, and management confirmation before finalization.`
      : `We reviewed ${total.toLocaleString("en-US")} ${rule.title} records and found that ${passed.toLocaleString("en-US")} records met the criteria, while ${exceptionCount.toLocaleString("en-US")} exceptions were identified, resulting in a ${passRate}% pass rate. The exceptions were not aligned with ${framework}, which requires that ${rule.criteria.toLowerCase()} The condition may have resulted from incomplete monitoring and control-review procedures. This increases the risk of unauthorized access, service disruption, or non-compliance with applicable requirements. Management should remediate the identified exceptions and strengthen ongoing monitoring.`
    : "There is insufficient evidence to draft an audit finding. Import the relevant records before running the analysis.";

  return {
    generatedAt: new Date().toISOString(),
    topic: rule.title,
    criteria: rule.criteria,
    summary: { total, passed, exceptions: exceptionCount, passRate },
    exceptions,
    complianceMatrix,
    references,
    narrative,
  };
}

function buildComplianceMatrix(exceptions, rule, framework) {
  const requirements = requirementLibrary[state.selection?.id] || requirementLibrary.scbx;
  const hasTerminated = exceptions.some((item) => /terminated|resigned/i.test(item.issue));
  const hasApprovalGap = exceptions.some((item) => /approval|privilege|excessive/i.test(item.issue));
  const hasDormant = exceptions.some((item) => /dormant|inactive|stale/i.test(item.issue));
  return requirements.map((requirement, index) => {
    const gapSignals = [
      hasTerminated && "terminated user access was identified",
      hasApprovalGap && "approval or privilege evidence was incomplete",
      hasDormant && "inactive or stale access was identified",
    ].filter(Boolean);
    const status = !exceptions.length ? "Compliant" : index === 0 ? "Partially Compliant" : gapSignals.length > 1 ? "Non-Compliant" : "Insufficient Evidence";
    const gap = status === "Compliant"
      ? "No exception noted from the sample evidence."
      : `${framework} requirement needs follow-up because ${gapSignals.join(", ") || "supporting evidence was not complete"}.`;
    return {
      reference: requirement.reference,
      source: requirement.source,
      requirement: requirement.requirement,
      topic: requirement.topic || rule.title,
      evidence: requirement.evidence,
      status,
      gap,
    };
  });
}

function getActiveReferences(topic = state.topic) {
  if (state.approach === "compliance") {
    const requirements = requirementLibrary[state.selection?.id] || requirementLibrary.scbx;
    return requirements.map((item) => ({
      reference: item.reference,
      source: item.source,
      requirement: item.requirement,
      procedures: item.procedures,
    }));
  }
  return controlReferences[state.selection?.id] || controlReferences[topic] || controlReferences.access;
}

function getActiveProcedures() {
  const seen = new Set();
  return getActiveReferences().flatMap((item) => item.procedures || []).filter((procedure) => {
    if (seen.has(procedure)) return false;
    seen.add(procedure);
    return true;
  });
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
  $("#pageTitle").textContent = ["New audit", "Define audit scope", state.approach === "compliance" ? "Requirements breakdown" : "Audit blueprint", "Review and run testing", "Audit outputs"][step - 1];
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
  $("#blueprintKicker").textContent = state.approach === "compliance" ? "REQUIREMENTS BREAKDOWN" : "AUDIT BLUEPRINT";
  $("#blueprintTitle").textContent = state.approach === "compliance" ? `${item.title} requirements breakdown` : `${item.title} audit blueprint`;
  $("#blueprintLead").textContent = state.approach === "compliance"
    ? "Review the decomposed requirements, mapped audit topics, expected evidence, and planned procedures."
    : "Review the plan below before importing your evidence.";
  $("#metaApproach").textContent = catalog[state.approach].label;
  $("#metaTopic").textContent = item.title;
  state.tab = "inputs";
  renderBlueprint();
  renderRunPreview();
  goToStep(3);
}

function renderBlueprint() {
  const blueprint = blueprints[state.topic] || blueprints.access;
  $(".blueprint-layout").classList.toggle("matrix-mode", state.approach === "compliance");
  if (state.approach === "compliance") {
    const requirements = requirementLibrary[state.selection.id] || requirementLibrary.scbx;
    $("#blueprintContent").innerHTML = `
      <h3>Requirement-to-control mapping</h3>
      <p>AI decomposes the selected standard into assessable requirements and maps each one to audit topic, evidence, and executable procedures.</p>
      <div class="table-wrap">
        <table class="mapping-table">
          <thead><tr><th>REFERENCE</th><th>REQUIREMENT</th><th>AUDIT TOPIC</th><th>EVIDENCE</th><th>MAPPED PROCEDURES</th></tr></thead>
          <tbody>
            ${requirements.map((item) => `
              <tr>
                <td><span class="reference-chip">${escapeHtml(item.reference)}</span><small>${escapeHtml(item.source)}</small></td>
                <td><strong>${escapeHtml(item.requirement)}</strong><small>${escapeHtml(item.objective)}</small></td>
                <td>${escapeHtml(item.topic)}</td>
                <td>${escapeHtml(item.evidence)}</td>
                <td><ul>${item.procedures.map((procedure) => `<li>${escapeHtml(procedure)}</li>`).join("")}</ul></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>`;
    return;
  }
  $$(".blueprint-tabs button").forEach((button) => button.classList.toggle("active", button.dataset.tab === state.tab));
  const headings = {
    inputs: ["Evidence to prepare", "These items support a complete analysis and reduce follow-up requests."],
    procedures: ["Audit procedures", "The evidence will be assessed using the following sequence."],
    outputs: ["Expected deliverables", "Outputs are structured for the working paper and audit report."],
    references: ["Testing references", "References used as the criteria basis for this assessment."],
  };
  const [title, description] = headings[state.tab];
  if (state.tab === "procedures") {
    const procedures = getActiveProcedures();
    $("#blueprintContent").innerHTML = `<h3>${title}</h3><p>${description}</p><ol class="procedure-list">${procedures.map((procedure) => `<li><strong>${escapeHtml(procedure)}</strong><span>Mapped from SCBX Group Standards reference criteria.</span></li>`).join("")}</ol>`;
    return;
  }
  if (state.tab === "references") {
    $("#blueprintContent").innerHTML = `<h3>${title}</h3><p>${description}</p><ul class="reference-list">${getActiveReferences().map((item) => `<li><span class="reference-chip">${escapeHtml(item.reference)}</span><div><strong>${escapeHtml(item.source)}</strong><small>${escapeHtml(item.requirement)}</small></div></li>`).join("")}</ul>`;
    return;
  }
  $("#blueprintContent").innerHTML = `<h3>${title}</h3><p>${description}</p><ul class="check-list">${blueprint[state.tab].map(([name, detail, format]) => `<li><span>✓</span><div><strong>${name}</strong><small>${detail}</small></div><i>${format}</i></li>`).join("")}</ul>`;
}

function renderRunPreview() {
  const blueprint = blueprints[state.topic] || blueprints.access;
  const title = state.selection?.title || auditRules[state.topic]?.title || "Access Control";
  const mode = catalog[state.approach]?.label || "Risk-based";
  $("#runKicker").textContent = state.approach === "compliance" ? "UPLOAD COMPLIANCE EVIDENCE" : "UPLOAD AUDIT DATA FILES";
  $("#runTitle").textContent = state.approach === "compliance" ? "Upload compliance evidence and run assessment" : "Upload audit data files";
  $("#runLead").textContent = state.approach === "compliance"
    ? "Upload the required evidence and review test procedures before starting the assessment."
    : "Please provide the required data files for this audit and review the planned procedures.";
  $("#runScopeTopic").textContent = title;
  $("#runScopeMode").textContent = mode;
  $("#runScopeData").textContent = state.records.length ? `${state.records.length.toLocaleString("en-US")} uploaded` : "Waiting for upload";
  const procedures = getActiveProcedures().slice(0, 6);
  $("#runProcedureList").innerHTML = procedures.map((procedure) => `<li>${escapeHtml(procedure)}</li>`).join("");
  $("#runReferenceList").innerHTML = getActiveReferences().map((item) => `<li><span class="reference-chip">${escapeHtml(item.reference)}</span><strong>${escapeHtml(item.source)}</strong><small>${escapeHtml(item.requirement)}</small></li>`).join("");
  $$(".compliance-only").forEach((item) => item.hidden = state.approach !== "compliance");
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
  renderRunPreview();
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
  renderRunPreview();
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
    goToStep(5);
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
  const isCompliance = state.approach === "compliance";
  $("#report").hidden = false;
  $("#reportKicker").textContent = isCompliance ? "COMPLIANCE RESULT" : "AUDIT RESULT";
  $("#reportTitle").innerHTML = isCompliance ? "Compliance results" : `<span id="reportTopic"></span> audit results`;
  if (!isCompliance) $("#reportTopic").textContent = report.topic;
  $("#reportTime").textContent = `Generated ${new Date(report.generatedAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}`;
  $("#totalRecords").textContent = report.summary.total.toLocaleString("en-US");
  $("#passedRecords").textContent = report.summary.passed.toLocaleString("en-US");
  $("#exceptionRecords").textContent = report.summary.exceptions.toLocaleString("en-US");
  $("#passRate").textContent = `${report.summary.passRate}%`;
  $("#rateRing").style.setProperty("--progress", `${report.summary.passRate}%`);
  $("#healthLabel").textContent = report.summary.passRate >= 90 ? "Healthy" : report.summary.passRate >= 70 ? "Monitor" : "Needs improvement";
  $("#healthLabel").style.color = report.summary.passRate >= 90 ? "var(--green)" : report.summary.passRate >= 70 ? "var(--yellow)" : "var(--coral)";
  $("#exceptionTable").innerHTML = report.exceptions.length
    ? report.exceptions.map((item) => `<tr><td>#${String(item.row).padStart(3, "0")}</td><td>${escapeHtml(item.reference)}</td><td>${escapeHtml(item.criteriaReference)}</td><td>${escapeHtml(item.issue)}</td><td><span class="risk-badge ${item.risk.toLowerCase()}">${item.risk}</span></td></tr>`).join("")
    : `<tr><td class="empty-table" colspan="5">No exceptions were identified in the tested records.</td></tr>`;
  $("#testingReferenceTable").innerHTML = report.references.map((item) => `
    <tr>
      <td><span class="reference-chip">${escapeHtml(item.reference)}</span></td>
      <td>${escapeHtml(item.source)}</td>
      <td>${escapeHtml(item.requirement)}</td>
    </tr>
  `).join("");
  $("#complianceMatrixSection").hidden = !isCompliance;
  $("#referenceIndex").textContent = "02";
  $("#narrativeIndex").textContent = isCompliance ? "04" : "03";
  if (isCompliance) {
    $("#complianceTable").innerHTML = report.complianceMatrix.map((item) => `
      <tr>
        <td><span class="reference-chip">${escapeHtml(item.reference)}</span><small>${escapeHtml(item.source)}</small></td>
        <td>${escapeHtml(item.requirement)}</td>
        <td>${escapeHtml(item.topic)}</td>
        <td>${escapeHtml(item.evidence)}</td>
        <td><span class="status-badge ${item.status.toLowerCase().replaceAll(" ", "-")}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.gap)}</td>
      </tr>
    `).join("");
  }
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
  renderRunPreview();
  goToStep(4);
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
  const rows = report.exceptions.map((item) => `${item.row},${item.reference},${item.criteriaReference},"${item.issue.replaceAll('"', '""')}",${item.risk}`).join("\n");
  const referenceRows = report.references.map((item) => `${item.reference},${item.source},"${item.requirement.replaceAll('"', '""')}"`).join("\n");
  const matrixRows = report.complianceMatrix?.map((item) => `${item.reference},${item.source},${item.requirement},${item.topic},"${item.evidence.replaceAll('"', '""')}",${item.status},"${item.gap.replaceAll('"', '""')}"`).join("\n") || "";
  const matrixSection = matrixRows ? `\n\nCOMPLIANCE MATRIX\nReference,Source,Requirement,Audit Topic,Evidence,Status,Gap / Observation\n${matrixRows}` : "";
  const text = `SCBX IT AUDIT WORKPAPER DRAFT\n\nMode: ${catalog[state.approach]?.label || "Risk-based"}\nTopic / Standard: ${state.selection?.title || report.topic}\nTotal Records: ${report.summary.total}\nPassed: ${report.summary.passed}\nExceptions: ${report.summary.exceptions}\nPass Rate: ${report.summary.passRate}%\n\nTESTING REFERENCES\nReference,Source,Criteria / Requirement\n${referenceRows}\n\nAUDITOR NARRATIVE\n${report.narrative}\n\nEXCEPTIONS\nRow,Reference,Criteria Reference,Issue,Risk\n${rows}${matrixSection}\n\nHUMAN REVIEW NOTE\nThis is a draft generated for auditor review, challenge, override, and finalization.`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\uFEFF" + text], { type: "text/plain;charset=utf-8" }));
  link.download = `SCBX_Audit_Workpaper_${new Date().toISOString().slice(0, 10)}.txt`;
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

function buildComplianceCsv(report) {
  const headers = ["Reference", "Source", "Requirement", "Audit Topic", "Evidence", "Status", "Gap / Observation"];
  const rows = report.complianceMatrix.map((item) => [item.reference, item.source, item.requirement, item.topic, item.evidence, item.status, item.gap]);
  return [headers, ...rows].map((row) => row.map((value) => {
    let text = String(value ?? "");
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  }).join(",")).join("\r\n");
}

function downloadComplianceMatrix() {
  if (!state.report?.complianceMatrix?.length) {
    showToast("No compliance matrix is available to download.");
    return;
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\uFEFF" + buildComplianceCsv(state.report)], { type: "text/csv;charset=utf-8" }));
  link.download = `SCBX_Compliance_Matrix_${state.selection?.id || "assessment"}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Compliance matrix downloaded.");
}

$$(".approach-card").forEach((card) => card.addEventListener("click", () => chooseApproach(card.dataset.approach)));
$$("[data-back]").forEach((button) => button.addEventListener("click", () => goToStep(Number(button.dataset.back))));
$$(".blueprint-tabs button").forEach((button) => button.addEventListener("click", () => { state.tab = button.dataset.tab; renderBlueprint(); }));
$$(".step").forEach((button) => button.addEventListener("click", () => { const target = Number(button.dataset.step); if (target < state.step) goToStep(target); }));
$("#continueToUpload").addEventListener("click", () => { renderRunPreview(); goToStep(4); });
$("#chooseFile").addEventListener("click", () => $("#fileInput").click());
$("#fileInput").addEventListener("change", (event) => handleFile(event.target.files[0]));
$("#removeFile").addEventListener("click", clearFile);
$("#useDemo").addEventListener("click", () => setRecords(demoRecords[state.topic] || demoRecords.access, `SCBX_demo_${state.topic}.csv`));
$("#analyzeButton").addEventListener("click", analyzeRecords);
$("#newAuditButton").addEventListener("click", resetAudit);
$("#resetAnalysis").addEventListener("click", resetAnalysis);
$("#downloadReport").addEventListener("click", downloadReport);
$("#downloadExceptions").addEventListener("click", downloadExceptionRegister);
$("#downloadComplianceMatrix").addEventListener("click", downloadComplianceMatrix);
$("#markReviewed").addEventListener("click", () => showToast("Marked as reviewed for auditor follow-up."));
$("#overrideClassification").addEventListener("click", () => showToast("Override captured as a prototype action."));
$("#finalizeWorkpaper").addEventListener("click", () => showToast("Workpaper finalized as draft output."));
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
