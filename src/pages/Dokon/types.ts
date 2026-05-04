interface Store {
  id: number;
  storeName: string;       // Do'kon nomi
  ownerFirstName: string;  // Egasi ismi
  ownerLastName: string;   // Familiyasi
  pinfl: string;           // 14 raqam
  inn: string;
  phone: string;
  category: 'Retail' | 'Diler' | 'VIP';
  region: string;
  district: string;
  address: string;
  geoLocation?: string;    // ixtiyoriy
}

interface StoreFormData {
  storeName: string;
  ownerFirstName: string;
  ownerLastName: string;
  pinfl: string;
  inn: string;
  phone: string;
  category: 'Retail' | 'Diler' | 'VIP' | '';
  region: string;
  district: string;
  address: string;
  geoLocation: string;
}

export type { Store, StoreFormData };