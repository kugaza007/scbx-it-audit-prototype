export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildExceptionCsv(report) {
  const sourceColumns = [...new Set(report.exceptions.flatMap((item) => Object.keys(item.record || {})))];
  const headers = ["Record", "Reference", "Criteria Reference", "Exception / Condition", "Risk Rating", ...sourceColumns];
  const rows = report.exceptions.map((item) => [
    item.row,
    item.reference,
    item.criteriaReference,
    item.issue,
    item.risk,
    ...sourceColumns.map((column) => item.record?.[column] ?? ""),
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
