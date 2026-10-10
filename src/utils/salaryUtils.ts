export function formatSalaryDisplay(rawSalary: any): string {
  if (!rawSalary) return "";
  if (typeof rawSalary === "string") return rawSalary.trim();
  if (typeof rawSalary === "number") return `€${rawSalary.toLocaleString("it-IT")}`;

  if (typeof rawSalary === "object" && rawSalary !== null) {
    const val = rawSalary.value !== undefined ? rawSalary.value : rawSalary;
    if (typeof val === "string") return val.trim();
    if (typeof val === "number") return `€${val.toLocaleString("it-IT")}`;

    if (typeof val === "object" && val !== null) {
      const min = val.minValue ?? val.min;
      const max = val.maxValue ?? val.max;
      const unit = val.unitText
        ? val.unitText === "YEAR"
          ? "/anno"
          : val.unitText === "MONTH"
          ? "/mese"
          : ` ${val.unitText}`
        : "";
      if (min && max) {
        return `€${Number(min).toLocaleString("it-IT")} - €${Number(max).toLocaleString("it-IT")}${unit}`;
      }
      if (min) return `da €${Number(min).toLocaleString("it-IT")}${unit}`;
      if (max) return `fino a €${Number(max).toLocaleString("it-IT")}${unit}`;
      if (val.value) return formatSalaryDisplay(val.value);
    }
    return "";
  }

  return "";
}

