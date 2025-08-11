"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, Eye } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Allocation {
  id: string
  project: string
  department: string
  amount: number
  percentage: number
  status: "active" | "pending" | "completed"
  date: string
  assignee: string
}

const mockAllocations: Allocation[] = [
  {
    id: "ALO-001",
    project: "Website Redesign",
    department: "Marketing",
    amount: 15000,
    percentage: 35,
    status: "active",
    date: "2024-01-15",
    assignee: "John Smith"
  },
  {
    id: "ALO-002",
    project: "Mobile App Development",
    department: "Engineering",
    amount: 25000,
    percentage: 60,
    status: "active",
    date: "2024-01-10",
    assignee: "Sarah Johnson"
  },
  {
    id: "ALO-003",
    project: "Market Research",
    department: "Research",
    amount: 8000,
    percentage: 20,
    status: "completed",
    date: "2024-01-05",
    assignee: "Mike Davis"
  },
  {
    id: "ALO-004",
    project: "Training Program",
    department: "HR",
    amount: 12000,
    percentage: 25,
    status: "pending",
    date: "2024-01-20",
    assignee: "Lisa Wilson"
  },
  {
    id: "ALO-005",
    project: "Infrastructure Upgrade",
    department: "IT",
    amount: 30000,
    percentage: 45,
    status: "active",
    date: "2024-01-12",
    assignee: "David Brown"
  }
]

export function AllocationsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [allocations] = useState<Allocation[]>(mockAllocations)

  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = allocation.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         allocation.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         allocation.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || allocation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const totalAmount = filteredAllocations.reduce((sum, allocation) => sum + allocation.amount, 0)
  const averagePercentage = filteredAllocations.length > 0 
    ? filteredAllocations.reduce((sum, allocation) => sum + allocation.percentage, 0) / filteredAllocations.length 
    : 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Allocations Table</h1>
          <p className="text-muted-foreground">Manage and track resource allocations across projects</p>
        </div>
        <Button>
          <Download className="size-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAllocations.length}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Allocated budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Resource utilization</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resource Allocations</CardTitle>
              <CardDescription>View and manage all project allocations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search allocations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.map((allocation) => (
                <TableRow key={allocation.id}>
                  <TableCell className="font-medium">{allocation.id}</TableCell>
                  <TableCell>{allocation.project}</TableCell>
                  <TableCell>{allocation.department}</TableCell>
                  <TableCell>{allocation.assignee}</TableCell>
                  <TableCell>${allocation.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(allocation.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{allocation.percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(allocation.status)}</TableCell>
                  <TableCell>{new Date(allocation.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
