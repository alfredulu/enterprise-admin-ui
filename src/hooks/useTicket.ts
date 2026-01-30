import { useQuery } from "@tanstack/react-query";
import { getTicketById } from "@/services/tickets";

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => {
      if (!id) throw new Error("Missing ticket id");
      return getTicketById(id);
    },
    enabled: !!id,
  });
}
