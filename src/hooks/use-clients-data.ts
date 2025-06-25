"use client"

import { useState, useEffect } from "react"
import { NanoMQApiService } from "@/lib/mock-data"
import type { ClientData } from "@/lib/nanomq-api"

export function useClientsData() {
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mockService = new NanoMQApiService()

  const fetchClients = async () => {
    setLoading(true)
    setError(null)

    try {
      // Real API call (commented out)
      // const clientsData = await api.getClients()

      // Mock API call
      const clientsData = await mockService.getClients()
      setClients(clientsData)
    } catch (err) {
      setError("Failed to fetch clients data")
      console.error("Clients fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
  }
}
