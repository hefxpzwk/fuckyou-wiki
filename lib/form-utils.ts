export function getText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function getBoolean(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export function getStringList(formData: FormData, name: string) {
  return getText(formData, name)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function requireText(formData: FormData, name: string, label: string) {
  const value = getText(formData, name);

  if (!value) {
    throw new Error(`${label}을(를) 입력해 주세요.`);
  }

  return value;
}

export function normalizeSeverity(value: string) {
  return value === "low" || value === "high" ? value : "medium";
}
