import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"

const upcomingEvents = [
  {
    title: "Parent-Teacher Conference",
    date: "Jan 15, 2025",
    time: "2:00 PM - 6:00 PM",
    location: "Main Hall",
    type: "meeting",
    priority: "high",
  },
  {
    title: "Science Fair",
    date: "Jan 18, 2025",
    time: "9:00 AM - 3:00 PM",
    location: "Gymnasium",
    type: "event",
    priority: "medium",
  },
  {
    title: "Staff Development Day",
    date: "Jan 22, 2025",
    time: "8:00 AM - 4:00 PM",
    location: "Conference Room",
    type: "training",
    priority: "medium",
  },
  {
    title: "Board Meeting",
    date: "Jan 25, 2025",
    time: "7:00 PM - 9:00 PM",
    location: "Board Room",
    type: "meeting",
    priority: "high",
  },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case "meeting":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "event":
      return "bg-green-100 text-green-800 border-green-200"
    case "training":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function UpcomingEvents() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                <Badge variant="outline" className={`text-xs ${getTypeColor(event.type)}`}>
                  {event.type}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
