"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Plus, Trash2 } from "lucide-react"

interface ItineraryItem {
  id: string
  date: string
  time: string
  title: string
  description: string
  location: string
  type: "flight" | "hotel" | "activity" | "restaurant" | "transport"
}

interface ItineraryBuilderProps {
  tripId: string
  initialItems?: ItineraryItem[]
}

export function ItineraryBuilder({ tripId, initialItems = [] }: ItineraryBuilderProps) {
  const [items, setItems] = useState<ItineraryItem[]>(initialItems)
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState<Partial<ItineraryItem>>({
    date: "",
    time: "",
    title: "",
    description: "",
    location: "",
    type: "activity",
  })

  const addItem = () => {
    if (newItem.title && newItem.date) {
      const item: ItineraryItem = {
        id: Date.now().toString(),
        date: newItem.date!,
        time: newItem.time || "09:00",
        title: newItem.title!,
        description: newItem.description || "",
        location: newItem.location || "",
        type: newItem.type as ItineraryItem["type"],
      }

      setItems(
        [...items, item].sort(
          (a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime(),
        ),
      )

      setNewItem({
        date: "",
        time: "",
        title: "",
        description: "",
        location: "",
        type: "activity",
      })
      setIsAdding(false)
    }
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const getTypeIcon = (type: ItineraryItem["type"]) => {
    switch (type) {
      case "flight":
        return "✈️"
      case "hotel":
        return "🏨"
      case "activity":
        return "🎯"
      case "restaurant":
        return "🍽️"
      case "transport":
        return "🚗"
      default:
        return "📍"
    }
  }

  const getTypeColor = (type: ItineraryItem["type"]) => {
    switch (type) {
      case "flight":
        return "bg-blue-100 text-blue-800"
      case "hotel":
        return "bg-purple-100 text-purple-800"
      case "activity":
        return "bg-green-100 text-green-800"
      case "restaurant":
        return "bg-orange-100 text-orange-800"
      case "transport":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Group items by date
  const groupedItems = items.reduce(
    (groups, item) => {
      const date = item.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(item)
      return groups
    },
    {} as Record<string, ItineraryItem[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Trip Itinerary</h3>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {isAdding && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Add Itinerary Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={newItem.date}
                  onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={newItem.time}
                  onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g., Visit Eiffel Tower"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as ItineraryItem["type"] })}
              >
                <option value="activity">Activity</option>
                <option value="flight">Flight</option>
                <option value="hotel">Hotel</option>
                <option value="restaurant">Restaurant</option>
                <option value="transport">Transport</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="e.g., Paris, France"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Additional details..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addItem}>Add Item</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(groupedItems).length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No itinerary items yet</h3>
            <p className="text-gray-600">Start building your trip itinerary by adding activities, flights, and more.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dayItems]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dayItems
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((item) => (
                        <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getTypeIcon(item.type)}</span>
                              <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-3 w-3 mr-1" />
                                {item.time}
                              </div>
                            </div>
                            <h4 className="font-medium">{item.title}</h4>
                            {item.location && (
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {item.location}
                              </div>
                            )}
                            {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
