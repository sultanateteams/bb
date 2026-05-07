import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Oynaga qaytganda avtomatik yangilamaslik
      retry: 1, // Xatolik bo'lsa 1 marta qayta urinish
      staleTime: 1000 * 60 * 5, // Ma'lumotlarni 5 minut davomida "yangi" deb hisoblash
    },
  },
});