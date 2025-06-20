"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Download, Trash2, Eye } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  category: "passport" | "visa" | "ticket" | "hotel" | "insurance" | "other"
  url?: string
}

interface DocumentStorageProps {
  tripId: string
  initialDocuments?: Document[]
}

export function DocumentStorage({ tripId, initialDocuments = [] }: DocumentStorageProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isUploading, setIsUploading] = useState(false)

  const categories = [
    { value: "passport", label: "Passport", color: "bg-blue-100 text-blue-800" },
    { value: "visa", label: "Visa", color: "bg-green-100 text-green-800" },
    { value: "ticket", label: "Tickets", color: "bg-purple-100 text-purple-800" },
    { value: "hotel", label: "Hotel", color: "bg-orange-100 text-orange-800" },
    { value: "insurance", label: "Insurance", color: "bg-red-100 text-red-800" },
    { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
  ]

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setIsUploading(true)

    // In a real app, you'd upload to cloud storage (Vercel Blob, AWS S3, etc.)
    for (const file of Array.from(files)) {
      const document: Document = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        category: "other", // Default category
        url: URL.createObjectURL(file), // For demo - in production use actual upload URL
      }

      setDocuments((prev) => [...prev, document])
    }

    setIsUploading(false)
    event.target.value = "" // Reset input
  }

  const updateCategory = (id: string, category: Document["category"]) => {
    setDocuments((docs) => docs.map((doc) => (doc.id === id ? { ...doc, category } : doc)))
  }

  const removeDocument = (id: string) => {
    setDocuments((docs) => docs.filter((doc) => doc.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getCategoryInfo = (category: Document["category"]) => {
    return categories.find((cat) => cat.value === category) || categories[categories.length - 1]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Travel Documents</h3>
        <div>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload">
            <Button asChild disabled={isUploading}>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Documents"}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
            <p className="text-gray-600 mb-4">
              Keep all your travel documents in one place - passports, visas, tickets, and more.
            </p>
            <label htmlFor="file-upload">
              <Button asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </span>
              </Button>
            </label>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => {
            const categoryInfo = getCategoryInfo(doc.category)

            return (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <FileText className="h-8 w-8 text-gray-400 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{doc.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <select
                            value={doc.category}
                            onChange={(e) => updateCategory(doc.id, e.target.value as Document["category"])}
                            className="text-xs border rounded px-2 py-1"
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                          <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      {doc.url && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(doc.url, "_blank")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // In a real app, trigger download
                          if (doc.url) {
                            const a = document.createElement("a")
                            a.href = doc.url
                            a.download = doc.name
                            a.click()
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload copies of important documents before you travel</li>
            <li>• Organize documents by category for easy access</li>
            <li>• Share access with travel companions</li>
            <li>• Keep digital copies separate from physical documents</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
