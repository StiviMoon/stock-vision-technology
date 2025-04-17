import { Badge } from "@/components/ui/badge";

export default function StockBadge({ stock }) {
  if (stock > 10) {
    return <Badge variant="success">{stock}</Badge>;
  } else if (stock > 0) {
    return <Badge variant="warning">{stock}</Badge>;
  } else {
    return <Badge variant="destructive">{stock}</Badge>;
  }
}