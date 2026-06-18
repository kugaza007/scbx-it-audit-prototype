# Risk-based Group Standards Mapping

Source ZIP: `Risk-based Group Standards.zip`

## File Inventory

| # | Group Standard file | Primary web app mapping |
|---|---|---|
| 1 | `SCBX-Capacity-Management-Standard.pdf` | Capacity Management, Data Backup |
| 2 | `SCBX-Change-Management-Standard.pdf` | Change Management |
| 3 | `SCBX-Configuration-Management-Standard.pdf` | System Configuration Management |
| 4 | `scbx-data-classification-standard.pdf` | Information Security, Data Security |
| 5 | `SCBX-Group_Cloud-Architecture-Standard.pdf` | System Configuration Management, Cloud Architecture |
| 6 | `SCBX-Group_Cloud-Security-Standard.pdf` | Access Control, Data Backup, Third Party Risk Management |
| 7 | `SCBX-Group_Cloud-Security-Standard_v1.0.pdf` | Legacy cloud security reference, not used as primary when v1.1 exists |
| 8 | `SCBX-Group_Cybersecurity-and-Technology-Risk-Awareness-Standard-1.pdf` | IT Governance, IT Risk Management |
| 9 | `SCBX-Group_Data-Security-and-Encryption-Standard-1.pdf` | Information Security |
| 10 | `SCBX-Group_Endpoint-and-Device-Security-Standard-1.pdf` | Endpoint Security |
| 11 | `SCBX-Group_Identity-and-Access-Management-Standard_v1.0.pdf` | Access Control |
| 12 | `SCBX-Group_IT-Asset-Management-Standard.pdf` | IT Asset Management |
| 13 | `SCBX-Group_IT-Third-Party-Risk-Management-Standard-1.pdf` | Third Party Risk Management |
| 14 | `SCBX-Group_IT_Project_Management_Standard-2.pdf` | IT Project Management |
| 15 | `SCBX-Group_Logging-and-Auditing-Standard-1.pdf` | Logging, Security Monitoring |
| 16 | `SCBX-Group_Network-Security-Standard-1.pdf` | Communications Security, Information Security |
| 17 | `SCBX-Group_Physical-and-Environmental-Security-Standard.pdf` | Physical and Environmental Security |
| 18 | `SCBX-Group_Secure-Application-Development-Standard.pdf` | System Acquisition and Development |
| 19 | `SCBX-Group_Security-Incident-Response-and-Management-Standard-1.pdf` | Incident Management, Security Monitoring |
| 20 | `SCBX-Group_Security-Remediation-and-Patch-Management-Standard.pdf` | Patch Management, Vulnerability Management and Penetration Test |
| 21 | `SCBX-Group_Technology-Risk-Management-Standard-2.pdf` | IT Governance, IT Risk Management |
| 22 | `SCBX-Incident-Management-standard-1.pdf` | Incident Management |
| 23 | `SCBX-Portfolio-Management-Standard-1.pdf` | IT Project Management |
| 24 | `SCBX-Problem-Management-Standard-1.pdf` | Incident / Problem Management |
| 25 | `SCBX-Release-and-Deployment-Management-Standard-1.pdf` | Change Management |

## Mapping Logic Applied In Web App

| Risk-based audit topic | Reference source used in app | Procedure focus |
|---|---|---|
| Access Control | Identity and Access Management Standard; Cloud Security Standard | User lifecycle, approval evidence, privileged access, MFA, entitlement review |
| System Configuration Management | Configuration Management Standard; Cloud Architecture Standard | Configuration baseline, ownership, deviation review, cloud design approval |
| Patch Management | Security Remediation and Patch Management Standard | Patch status, overdue critical/high remediation, rescanning evidence |
| Logging | Logging and Auditing Standard | Log coverage, centralized logging, retention, monitoring evidence |
| Capacity Management | Capacity Management Standard | Capacity metrics, forecasting, plans, threshold breaches |
| Security Monitoring | Logging and Auditing Standard; Security Incident Response and Management Standard | Alert rules, monitoring coverage, escalation, sampled alert follow-up |
| Data Backup | Cloud Security Standard; Capacity Management Standard | Backup status, restoration evidence, backup encryption, recovery procedures |
| Endpoint Security | Endpoint and Device Security Standard | Endpoint coverage, managed device status, protection controls |
| System Acquisition and Development | Secure Application Development Standard | Secure SDLC, security testing, remediation before release |
| Incident / Problem Management | Security Incident Response and Management Standard; Incident Management Standard; Problem Management Standard | Incident SLA, escalation, RCA, corrective action, recurring incidents |
| Third Party Risk Management | IT Third Party Risk Management Standard; Cloud Security Standard | Vendor due diligence, contracts, ongoing monitoring, provider certifications |
| IT Project Management | IT Project Management Standard; Portfolio Management Standard | Governance gates, project risk, testing, implementation and closure artifacts |

## Notes

- The web app uses these standards as prototype reference criteria for audit planning, testing references, exception criteria references, compliance matrix references, and workpaper exports.
- Where duplicate standards exist, the newer non-legacy version is used as primary reference.
- The extracted files remain under `.tools/risk_based_group_standards/` for local analysis and are not required at runtime by the static GitHub Pages prototype.
