import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTicket } from "@/services/tickets";

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateTicket(id, updates),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
