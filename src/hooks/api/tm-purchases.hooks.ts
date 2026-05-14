import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTmPurchases,
  getTmPurchaseByID,
  createTmPurchase,
  deleteTmPurchase,
  addTmTransaction,
  type CreateTmPurchasePayload,
  type AddTmTransactionPayload,
} from "@/services/tm-purchases.service";

export const TM_PURCHASES_KEY = ["tm-purchases"];

export function useTmPurchasesQuery(params?: {
  page?: number;
  limit?: number;
  supplier_id?: number;
  search?: string;
  only_with_debt?: boolean;
  purchase_type?: "tm" | "raw_material";
}) {
  return useQuery({
    queryKey: [...TM_PURCHASES_KEY, params],
    queryFn: () => getTmPurchases(params),
  });
}

export function useTmPurchaseByIDQuery(id: number) {
  return useQuery({
    queryKey: [...TM_PURCHASES_KEY, id],
    queryFn: () => getTmPurchaseByID(id),
    enabled: id > 0,
  });
}

export function useCreateTmPurchaseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTmPurchasePayload) => createTmPurchase(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TM_PURCHASES_KEY });
    },
  });
}

export function useDeleteTmPurchaseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTmPurchase(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TM_PURCHASES_KEY });
    },
  });
}

export function useAddTmTransactionMutation(purchaseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddTmTransactionPayload) => addTmTransaction(purchaseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TM_PURCHASES_KEY });
    },
  });
}
