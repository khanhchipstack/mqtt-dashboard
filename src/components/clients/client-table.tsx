"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import type { ClientData } from "@/lib/nanomq-api"

interface ClientTableProps {
  clients: ClientData[]
}

export function ClientTable({ clients }: ClientTableProps) {
  const [filteredClients, setFilteredClients] = useState<ClientData[]>(clients)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.username.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredClients(filtered)
  }, [searchTerm, clients])

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Danh sách Clients</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Client ID</TableHead>
              <TableHead className="text-gray-300">Tên người dùng</TableHead>
              <TableHead className="text-gray-300">Trạng thái</TableHead>
              <TableHead className="text-gray-300">Protocol</TableHead>
              <TableHead className="text-gray-300">Keep Alive</TableHead>
              <TableHead className="text-gray-300">Tin nhắn</TableHead>
              <TableHead className="text-gray-300">Clean Start</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.client_id} className="border-gray-700">
                <TableCell className="text-white font-mono text-sm">{client.client_id}</TableCell>
                <TableCell className="text-white">{client.username}</TableCell>
                <TableCell>
                  <Badge
                    variant={client.conn_state === "connected" ? "default" : "destructive"}
                    className={client.conn_state === "connected" ? "bg-green-600" : "bg-red-600"}
                  >
                    {client.conn_state === "connected" ? "Đã kết nối" : "Ngắt kết nối"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-300">
                  {client.proto_name} v{client.proto_ver}
                </TableCell>
                <TableCell className="text-gray-300">{client.keepalive}s</TableCell>
                <TableCell className="text-gray-300">{client.recv_msg}</TableCell>
                <TableCell className="text-gray-300">
                  <Badge variant={client.clean_start ? "default" : "secondary"}>
                    {client.clean_start ? "Có" : "Không"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
