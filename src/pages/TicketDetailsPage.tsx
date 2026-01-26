import { useParams } from "react-router-dom";

export default function TicketDetailsPage() {
  const { id } = useParams();
  return (
    <div className="space-y-2">
      <div className="text-xl font-semibold">Ticket Details</div>
      <div className="text-sm text-muted-foreground">Ticket ID: {id}</div>
    </div>
  );
}
