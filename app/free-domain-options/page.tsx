"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink, XCircle, HelpCircle, Zap } from "lucide-react"

export default function FreeDomainOptions() {
  const [testingOption, setTestingOption] = useState<string | null>(null)

  const freeOptions = [
    {
      id: "freenom",
      name: "Freenom (.tk, .ml, .ga)",
      status: "blocked",
      reason: "Resend blocks these due to spam history",
      reliability: "Low",
      icon: XCircle,
      color: "red",
    },
    {
      id: "freedns",
      name: "FreeDNS Subdomains",
      status: "blocked",
      reason: "Most subdomains are blocked by email services",
      reliability: "Low",
      icon: XCircle,
      color: "red",
    },
    {
      id: "noip",
      name: "No-IP Free Hostnames",
      status: "blocked",
      reason: "Dynamic DNS services are blocked",
      reliability: "Low",
      icon: XCircle,
      color: "red",
    },
    {
      id: "github-pages",
      name: "GitHub Pages (.github.io)",
      status: "blocked",
      reason: "Free hosting domains are blocked",
      reliability: "Medium",
      icon: XCircle,
      color: "red",
    },
    {
      id: "student",
      name: "Student .edu Domain",
      status: "maybe",
      reason: "If you're a student, your school domain might work",
      reliability: "High",
      icon: HelpCircle,
      color: "yellow",
    },
  ]

  const alternatives = [
    {
      id: "testing-mode",
      title: "Continue Testing Mode",
      description: "Use your verified email for development",
      cost: "Free",
      pros: ["Works immediately", "No setup", "Good for development"],
      cons: ["Only your email", "Not production-ready"],
      action: "Keep developing",
    },
    {
      id: "cheap-domain",
      title: "Cheapest Real Domain",
      description: "Buy the absolute cheapest domain available",
      cost: "$0.99-2.99/year",
      pros: ["Professional", "Works everywhere", "Production ready"],
      cons: ["Small yearly cost"],
      action: "Find deals",
    },
    {
      id: "shared-domain",
      title: "Share Someone's Domain",
      description: "Ask a friend/family to create a subdomain",
      cost: "Free",
      pros: ["No cost to you", "Professional appearance"],
      cons: ["Depends on others", "Not fully yours"],
      action: "Ask around",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Free Domain Options for Resend</h1>
          <p className="text-gray-600">Let's explore what's actually possible (spoiler: not much)</p>
        </div>

        {/* Reality Check */}
        <Alert className="mb-8 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Reality Check:</strong> Resend (and most professional email services) block nearly all free domain
            options to prevent spam and abuse. This is industry standard.
          </AlertDescription>
        </Alert>

        {/* Free Options Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>❌ Why Free Domains Don't Work</CardTitle>
            <CardDescription>Here's what I tested and why they're blocked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {freeOptions.map((option) => {
                const IconComponent = option.icon
                const colorClass =
                  option.color === "red"
                    ? "text-red-600"
                    : option.color === "yellow"
                      ? "text-yellow-600"
                      : "text-gray-600"

                return (
                  <div key={option.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <IconComponent className={`w-5 h-5 ${colorClass} mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{option.name}</span>
                        <Badge variant={option.status === "blocked" ? "destructive" : "secondary"} className="text-xs">
                          {option.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{option.reason}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Realistic Alternatives */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {alternatives.map((alt) => (
            <Card key={alt.id} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{alt.title}</CardTitle>
                <CardDescription>{alt.description}</CardDescription>
                <div className="text-2xl font-bold text-green-600">{alt.cost}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">✅ Pros:</h4>
                  <ul className="text-sm space-y-1">
                    {alt.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">❌ Cons:</h4>
                  <ul className="text-sm space-y-1">
                    {alt.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cheapest Domain Deals */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">💰 Cheapest Domain Deals Right Now</CardTitle>
            <CardDescription className="text-green-700">
              If you decide to spend a tiny amount, here are the best deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">🏆 Ultra-Cheap Options:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>.xyz domains</span>
                    <Badge variant="outline">$0.99/year</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>.top domains</span>
                    <Badge variant="outline">$1.99/year</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>.site domains</span>
                    <Badge variant="outline">$2.99/year</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">🎯 Professional Options:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>.com domains</span>
                    <Badge variant="outline">$8.88/year</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>.net domains</span>
                    <Badge variant="outline">$9.99/year</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span>.org domains</span>
                    <Badge variant="outline">$10.99/year</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() =>
                  window.open("https://www.namecheap.com/domains/registration/results/?domain=xyz", "_blank")
                }
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Find $0.99 Domains
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("https://www.namecheap.com", "_blank")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Browse All Deals
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Testing Strategy */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Zap className="w-5 h-5" />🧪 My Testing Strategy Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-blue-700">
                <strong>For now:</strong> Continue using your Gmail (humayunejazm@gmail.com) for testing. It works
                perfectly for development.
              </p>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Development Plan:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. ✅ Keep testing with your email (works now)</li>
                  <li>2. 🚀 Build and perfect your app features</li>
                  <li>3. 🎯 When ready for real users, buy a $0.99 domain</li>
                  <li>4. 📧 Set up production email in 15 minutes</li>
                  <li>5. 🌟 Launch with professional email!</li>
                </ol>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro tip:</strong> You can build your entire app and test everything with your Gmail. Only buy
                  a domain when you're ready to invite real users!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
