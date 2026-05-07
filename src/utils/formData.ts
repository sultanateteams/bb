/**
 * Recursively converts a nested object to FormData.
 * Handles nested objects, arrays, files, and primitive values.
 *
 * @param obj - The data object to convert
 * @param formData - Existing FormData instance (used internally for recursion)
 * @param parentKey - Key prefix for nested paths (used internally)
 * @returns FormData instance
 */
export function toFormData(
  obj: Record<string, any>,
  formData: FormData = new FormData(),
  parentKey: string = "",
): FormData {
  if (obj === null || obj === undefined) return formData;

  for (const [key, value] of Object.entries(obj)) {
    const fieldKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value === null || value === undefined) {
      continue;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(fieldKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${fieldKey}[${index}]`;
        if (typeof item === "object" && !(item instanceof File) && !(item instanceof Blob)) {
          toFormData(item, formData, arrayKey);
        } else if (item instanceof File || item instanceof Blob) {
          formData.append(arrayKey, item);
        } else {
          formData.append(arrayKey, String(item));
        }
      });
    } else if (typeof value === "object") {
      toFormData(value, formData, fieldKey);
    } else {
      formData.append(fieldKey, String(value));
    }
  }

  return formData;
}