"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Plus, Trash2, TrendingUp } from "lucide-react"

interface BudgetItem {
  id: string
  category: string
  budgeted: number
  spent: number
  description: string
}

interface BudgetTrackerProps {
  tripId: string
  initialBudget?: BudgetItem[]
}

export function BudgetTracker({ tripId, initialBudget = [] }: BudgetTrackerProps) {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialBudget)
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({
    category: "",
    budgeted: "",
    spent: "",
    description: "",
  })

  const categories = ["Flights", "Hotels", "Food", "Activities", "Transport", "Shopping", "Emergency", "Other"]

  const addBudgetItem = () => {
    if (newItem.category && newItem.budgeted) {
      const item: BudgetItem = {
        id: Date.now().toString(),
        category: newItem.category,
        budgeted: Number.parseFloat(newItem.budgeted),
        spent: Number.parseFloat(newItem.spent) || 0,
        description: newItem.description,
      }

      setBudgetItems([...budgetItems, item])
      setNewItem({ category: "", budgeted: "", spent: "", description: "" })
      setIsAdding(false)
    }
  }

  const updateSpent = (id: string, spent: number) => {
    setBudgetItems((items) => items.map((item) => (item.id === id ? { ...item, spent } : item)))
  }

  const removeItem = (id: string) => {
    setBudgetItems((items) => items.filter((item) => item.id !== id))
  }

  const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.budgeted, 0)
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0)
  const remaining = totalBudgeted - totalSpent
  const spentPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Budget Tracker</h3>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-blue-600">${totalBudgeted.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${remaining.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Progress</span>
              <span>{spentPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(spentPercentage, 100)} className={spentPercentage > 100 ? "bg-red-100" : ""} />
            {spentPercentage > 100 && (
              <p className="text-sm text-red-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Over budget by ${(totalSpent - totalBudgeted).toFixed(2)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Category */}
      {isAdding && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Add Budget Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="w-full p-2 border rounded-md"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Budgeted Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newItem.budgeted}
                  onChange={(e) => setNewItem({ ...newItem, budgeted: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Already Spent</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newItem.spent}
                  onChange={(e) => setNewItem({ ...newItem, spent: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="e.g., Round-trip flights to Paris"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addBudgetItem}>Add Category</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Categories */}
      {budgetItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budget categories yet</h3>
            <p className="text-gray-600">Start tracking your trip expenses by adding budget categories.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {budgetItems.map((item) => {
            const percentage = item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0
            const isOverBudget = item.spent > item.budgeted

            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{item.category}</h4>
                      {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
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

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Budgeted</p>
                      <p className="font-medium">${item.budgeted.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Spent</p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={item.spent}
                          onChange={(e) => updateSpent(item.id, Number.parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Remaining</p>
                      <p className={`font-medium ${isOverBudget ? "text-red-600" : "text-green-600"}`}>
                        ${(item.budgeted - item.spent).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className={isOverBudget ? "bg-red-100" : ""} />
                    {isOverBudget && (
                      <p className="text-xs text-red-600">Over budget by ${(item.spent - item.budgeted).toFixed(2)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
