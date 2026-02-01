import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTicket } from "@/services/tickets";

type CreateTicketInput = {
  title: string;
  status: string;
  priority: string;
};

export function useCreateTicket() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["ticket_stats"] });
    },
  });
}
