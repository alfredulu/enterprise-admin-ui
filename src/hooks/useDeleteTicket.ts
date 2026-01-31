import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTicket } from "@/services/tickets";

export function useDeleteTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["ticket_stats"] });
    },
  });
}
