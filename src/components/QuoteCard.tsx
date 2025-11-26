import { Card, CardContent } from "@/components/ui/card"
import { Award } from "lucide-react"

interface QuoteCardProps {
  quote: string
  author: string
}

export function QuoteCard({ quote, author }: QuoteCardProps) {
  return (
    <Card className="bg-linear-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="pt-8 pb-8">
        <div className="text-center">
          <Award className="w-8 h-8 text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2 italic">"{quote}"</p>
          <p className="text-sm text-muted-foreground">— {author}</p>
        </div>
      </CardContent>
    </Card>
  )
}
