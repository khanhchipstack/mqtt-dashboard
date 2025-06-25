"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, Zap, Shield, Wrench } from "lucide-react"

export function ServerLimitations() {
  return (
    <Card className="bg-gray-800 border-gray-700 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-yellow-500">
          <AlertTriangle className="h-5 w-5" />
          <span>Test Server Limitations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="bg-yellow-900/20 border-yellow-600 mb-4">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            <strong>Important:</strong> This is a test server with the following limitations:
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <Clock className="h-4 w-4 text-red-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Connection Time Limit</p>
              <p className="text-gray-400">Maximum 30 minutes per session, then 15 minutes cooldown</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Zap className="h-4 w-4 text-orange-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Rate Limiting</p>
              <p className="text-gray-400">3KB/s per connection, 5 connections per IP</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Wrench className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Maintenance</p>
              <p className="text-gray-400">Server may become unavailable without prior notice</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Shield className="h-4 w-4 text-purple-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">SLA</p>
              <p className="text-gray-400">No service level agreement guaranteed</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
