interface Dealer {
  id: number;
  firstName: string;      // Ismi
  lastName: string;       // Familiyasi
  middleName?: string;    // Sharifi
  pinfl: string;          // 14 raqam
  inn: string;            // Soliq raqami
  region: string;         // Viloyat
  district: string;       // Tuman
  street?: string;        // Ko'cha
  address: string;        // To'liq manzil
}

interface DealerFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  pinfl: string;
  inn: string;
  region: string;
  district: string;
  street: string;
  address: string;
}

export type { Dealer, DealerFormData };