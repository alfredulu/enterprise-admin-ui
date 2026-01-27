import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTicket } from "@/services/tickets";

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
