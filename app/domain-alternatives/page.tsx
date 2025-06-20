"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink, DollarSign, Zap, Clock, Shield } from "lucide-react"

export default function DomainAlternatives() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const options = [
    {
      id: "cheap-domain",
      title: "Buy Cheap Domain",
      price: "$8-12/year",
      time: "15 minutes",
      difficulty: "Easy",
      icon: DollarSign,
      color: "green",
      recommended: true,
      pros: [
        "Professional appearance",
        "Full control over domain",
        "Works with all email services",
        "Can use for website too",
        "One-time yearly cost",
      ],
      cons: ["Small yearly cost", "Need to manage renewal"],
      steps: [
        "Go to Namecheap.com",
        "Search for domain (e.g., yourtravelapp.com)",
        "Buy domain ($8-12/year)",
        "Add to Resend",
        "Configure DNS",
        "Update code",
      ],
    },
    {
      id: "keep-testing",
      title: "Keep Testing Mode",
      price: "Free",
      time: "0 minutes",
      difficulty: "None",
      icon: Zap,
      color: "blue",
      recommended: false,
      pros: ["No cost", "Works immediately", "Good for development", "No setup needed"],
      cons: [
        "Only works with your email",
        "Can't invite real collaborators",
        "Not suitable for production",
        "Limited functionality",
      ],
      steps: [
        "Continue using humayunejazm@gmail.com",
        "Only invite yourself for testing",
        "Buy domain when ready for production",
      ],
    },
    {
      id: "custom-subdomain",
      title: "Custom Subdomain",
      price: "$10-15/year",
      time: "20 minutes",
      difficulty: "Medium",
      icon: Shield,
      color: "purple",
      recommended: false,
      pros: ["Professional email subdomain", "Separate from main website", "Good organization", "Full email control"],
      cons: ["Need main domain first", "More DNS configuration", "Slightly more complex"],
      steps: [
        "Buy main domain (e.g., yourname.com)",
        "Create subdomain (mail.yourname.com)",
        "Add subdomain to Resend",
        "Configure DNS records",
        "Update code",
      ],
    },
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return {
          border: "border-green-200",
          bg: "bg-green-50",
          text: "text-green-800",
          button: "bg-green-600 hover:bg-green-700",
        }
      case "blue":
        return {
          border: "border-blue-200",
          bg: "bg-blue-50",
          text: "text-blue-800",
          button: "bg-blue-600 hover:bg-blue-700",
        }
      case "purple":
        return {
          border: "border-purple-200",
          bg: "bg-purple-50",
          text: "text-purple-800",
          button: "bg-purple-600 hover:bg-purple-700",
        }
      default:
        return {
          border: "border-gray-200",
          bg: "bg-gray-50",
          text: "text-gray-800",
          button: "bg-gray-600 hover:bg-gray-700",
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚫 Resend Doesn't Allow Free Domains</h1>
          <p className="text-gray-600">Here are your best alternatives to get email working</p>
        </div>

        {/* Why This Happens */}
        <Alert className="mb-8 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Why Resend blocks free domains:</strong> Services like .vercel.app, .netlify.app, .herokuapp.com are
            blocked to prevent spam and abuse. This is standard practice for professional email services.
          </AlertDescription>
        </Alert>

        {/* Options Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {options.map((option) => {
            const colors = getColorClasses(option.color)
            const OptionIcon = option.icon

            return (
              <Card
                key={option.id}
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  selectedOption === option.id ? `${colors.border} ${colors.bg}` : ""
                } ${option.recommended ? "ring-2 ring-green-400" : ""}`}
                onClick={() => setSelectedOption(selectedOption === option.id ? null : option.id)}
              >
                {option.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">Recommended</Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <OptionIcon className="w-5 h-5" />
                    {option.title}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {option.price}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {option.time}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">✅ Pros:</h4>
                      <ul className="text-sm space-y-1">
                        {option.pros.map((pro, index) => (
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
                        {option.cons.map((con, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedOption === option.id && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2">📋 Steps:</h4>
                        <ol className="text-sm space-y-1">
                          {option.steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recommended Action */}
        <Card className="bg-green-50 border-green-200 mb-8">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />🎯 My Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700">
                <strong>Buy a cheap domain for $8-12/year.</strong> It's the most professional solution and gives you
                full control.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">🏆 Best Domain Registrars:</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.open("https://www.namecheap.com", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Namecheap - $8.88/year
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.open("https://domains.google", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Google Domains - $12/year
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.open("https://www.cloudflare.com/products/registrar/", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Cloudflare - $9.15/year
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-800 mb-2">💡 Domain Name Ideas:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>• yourtravelapp.com</div>
                    <div>• tripplanner[yourname].com</div>
                    <div>• [yourname]travels.com</div>
                    <div>• planmytrip[something].com</div>
                    <div>• travelwith[yourname].com</div>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro tip:</strong> After buying a domain, you can use it for both email AND as your website
                  domain when you're ready to launch!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Quick Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Quick Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Option</th>
                    <th className="text-left p-2">Cost</th>
                    <th className="text-left p-2">Setup Time</th>
                    <th className="text-left p-2">Can Email Anyone?</th>
                    <th className="text-left p-2">Professional?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-green-50">
                    <td className="p-2 font-medium">Buy Domain</td>
                    <td className="p-2">$8-12/year</td>
                    <td className="p-2">15 minutes</td>
                    <td className="p-2">✅ Yes</td>
                    <td className="p-2">✅ Very</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Keep Testing</td>
                    <td className="p-2">Free</td>
                    <td className="p-2">0 minutes</td>
                    <td className="p-2">❌ Only yourself</td>
                    <td className="p-2">❌ No</td>
                  </tr>
                  <tr>
                    <td className="p-2">Custom Subdomain</td>
                    <td className="p-2">$10-15/year</td>
                    <td className="p-2">20 minutes</td>
                    <td className="p-2">✅ Yes</td>
                    <td className="p-2">✅ Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
