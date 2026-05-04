interface Driver {
  id: number;
  firstName: string;      // Ismi
  lastName: string;       // Familiyasi
  middleName?: string;    // Sharifi
  pinfl: string;          // 14 raqam
  phone: string;
  carPlate: string;       // Mashina raqami
}

interface DriverFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  pinfl: string;
  phone: string;
  carPlate: string;
}

export type { Driver, DriverFormData };