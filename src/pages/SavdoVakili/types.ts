interface SalesAgent {
  id: number;
  firstName: string;       // Ismi
  lastName: string;        // Familiyasi
  middleName?: string;     // Sharifi
  pinfl: string;           // 14 raqam
  phone: string;
  commissionRate: number;  // Foiz (masalan: 3.5)
  activeOrders?: number;   // Faol buyurtmalar soni
}

interface SalesAgentFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  pinfl: string;
  phone: string;
  commissionRate: number | '';
}

export type { SalesAgent, SalesAgentFormData };