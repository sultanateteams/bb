interface Employee {
  id: number;
  firstName: string;       // Ismi
  lastName: string;        // Familiyasi
  middleName?: string;     // Sharifi (ixtiyoriy)
  pinfl: string;           // 14 raqamli PINFL
  phone: string;           // Telefon
  position: string;        // Lavozimi
  systemLogin?: string;    // Email (ixtiyoriy)
  role?: 'Admin' | 'Operator'; // faqat systemLogin bo'lsa
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  pinfl: string;
  phone: string;
  position: string;
  systemLogin: string;
  role: 'Admin' | 'Operator' | '';
}

export type { Employee, EmployeeFormData };