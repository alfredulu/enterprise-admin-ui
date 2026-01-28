import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTicket } from "@/services/tickets";
import type { Ticket } from "@/types/ticket";

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<Ticket, "status" | "priority" | "title">>;
    }) => updateTicket(id, updates),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tickets"] });

      const previousTickets = queryClient.getQueryData<Ticket[]>(["tickets"]);

      queryClient.setQueryData<Ticket[]>(["tickets"], (old) =>
        old?.map((ticket) =>
          ticket.id === id ? { ...ticket, ...updates } : ticket
        )
      );

      return { previousTickets };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(["tickets"], context.previousTickets);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
