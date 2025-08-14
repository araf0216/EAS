"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, Eye, ArrowLeft, Check, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Invoice {
  id: string
  invoiceNumber: string
  companyName: string
  invoiceTotal: number
  status: "Pending Approval" | "Approved" | "Rejected" | "Completed"
  activityType: "Pending" | "Complete" | "Reimbursable" | "Deal Allocation" | "Out of FM"
  receivedDate: string
  dueDate: string
}

interface Fund {
  id: string
  name: string
  aum: number
  percentage: number
  amountAllocated: number
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    companyName: "Acme Corporation",
    invoiceTotal: 15000,
    status: "Completed",
    activityType: "Complete",
    receivedDate: "2024-01-15",
    dueDate: "2024-02-15",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    companyName: "Tech Solutions Inc",
    invoiceTotal: 25000,
    status: "Approved",
    activityType: "Pending",
    receivedDate: "2024-01-10",
    dueDate: "2024-02-10",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    companyName: "Research Partners LLC",
    invoiceTotal: 8000,
    status: "Completed",
    activityType: "Reimbursable",
    receivedDate: "2024-01-05",
    dueDate: "2024-02-05",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    companyName: "Learning Solutions",
    invoiceTotal: 12000,
    status: "Pending Approval",
    activityType: "Pending",
    receivedDate: "2024-01-20",
    dueDate: "2024-02-20",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    companyName: "Cloud Systems Ltd",
    invoiceTotal: 30000,
    status: "Rejected",
    activityType: "Pending",
    receivedDate: "2024-01-12",
    dueDate: "2024-02-12",
  },
]

// Fund data with military alphabet names
const generateFunds = (invoiceTotal: number): Fund[] => {
  console.log(invoiceTotal)

  const totalAUM = 4123000000 // $4.123B
  const fundNames = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel"]

  // Generate random AUM values that sum to totalAUM
  const aumValues = [
    850000000, // Alpha
    720000000, // Bravo
    650000000, // Charlie
    580000000, // Delta
    490000000, // Echo
    420000000, // Foxtrot
    250000000, // Golf
    153000000, // Hotel
  ]

  return fundNames.map((name, index) => {
    const aum = aumValues[index]
    const percentage = (aum / totalAUM) * 100
    const amountAllocated = (percentage / 100) * invoiceTotal

    console.log(name)
    console.log(amountAllocated)

    return {
      id: `fund-${index + 1}`,
      name: `Fund ${name}`,
      aum,
      percentage,
      amountAllocated,
    }
  })
}

interface WarehouseProps {
  invoices?: Invoice[]
  onInvoiceUpdate?: (updatedInvoice: Invoice) => void
}

export function Warehouse({ invoices: propInvoices, onInvoiceUpdate }: WarehouseProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [invoices, setInvoices] = useState<Invoice[]>(propInvoices || mockInvoices)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [funds, setFunds] = useState<Fund[]>([])
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [selectedActivityType, setSelectedActivityType] = useState<Invoice["activityType"]>("Pending")

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "Pending Approval":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Approval</Badge>
      case "Approved":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Approved</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getActivityTypeBadge = (activityType: Invoice["activityType"]) => {
    switch (activityType) {
      case "Pending":
        return <Badge variant="outline">Pending</Badge>
      case "Complete":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>
      case "Reimbursable":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reimbursable</Badge>
      case "Deal Allocation":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Deal Allocation</Badge>
      case "Out of FM":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Out of FM</Badge>
      default:
        return <Badge variant="secondary">{activityType}</Badge>
    }
  }

  const totalInvoiceAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.invoiceTotal, 0)

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setFunds(generateFunds(invoice.invoiceTotal))
  }

  const handleBackToWarehouse = () => {
    setSelectedInvoice(null)
    setFunds([])
  }

  const handleApprovalAction = (invoice: Invoice, action: "Approved" | "Rejected") => {
    const updatedInvoice = { ...invoice, status: action }
    updateInvoice(updatedInvoice)
    setApprovalDialogOpen(false)
  }

  const handleActivityTypeUpdate = (invoice: Invoice, activityType: Invoice["activityType"]) => {
    const updatedInvoice = {
      ...invoice,
      activityType,
      status: activityType === "Pending" ? "Approved" : "Completed",
    }
    updateInvoice(updatedInvoice)
    setActivityDialogOpen(false)
  }

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)))
    if (onInvoiceUpdate) {
      onInvoiceUpdate(updatedInvoice)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(3)}B`
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    } else {
      return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  }

  if (selectedInvoice) {
    const totalFundAUM = funds.reduce((sum, fund) => sum + fund.aum, 0)
    const totalAllocated = funds.reduce((sum, fund) => sum + fund.amountAllocated, 0)

    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToWarehouse}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Invoice Warehouse
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Allocation Table</h1>
              <p className="text-muted-foreground">Detailed fund allocations for {selectedInvoice.invoiceNumber}</p>
            </div>
          </div>
          <Button>
            <Download className="size-4 mr-2" />
            Export Allocations
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoice Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(selectedInvoice.invoiceTotal)}</div>
              <p className="text-xs text-muted-foreground">Total invoice amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedInvoice.companyName}</div>
              <p className="text-xs text-muted-foreground">Invoice issuer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(selectedInvoice.receivedDate).toLocaleDateString()}</div>
              <p className="text-xs text-muted-foreground">Date received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
              <p className="text-xs text-muted-foreground">Payment due</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fund Allocations</CardTitle>
            <CardDescription>Breakdown of allocations across all funds</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund</TableHead>
                  <TableHead>AUM</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Amount Allocated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds.map((fund) => (
                  <TableRow key={fund.id}>
                    <TableCell className="font-medium">{fund.name}</TableCell>
                    <TableCell>{formatCurrency(fund.aum)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(fund.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{fund.percentage.toFixed(3)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(fund.amountAllocated)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total AUM:</span>
                  <span>$4.123B</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Allocated:</span>
                  <span>{totalInvoiceAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Warehouse</h1>
          <p className="text-muted-foreground">Manage and track invoices across the warehouse</p>
        </div>
        <Button>
          <Download className="size-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
            <p className="text-xs text-muted-foreground">Active invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4.123B</div>
            <p className="text-xs text-muted-foreground">Assets under management</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoice Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInvoiceAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total invoice amount</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice Warehouse</CardTitle>
              <CardDescription>View and manage all invoices in the warehouse</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Invoice Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity Type</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.companyName}</TableCell>
                  <TableCell>${invoice.invoiceTotal.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{getActivityTypeBadge(invoice.activityType)}</TableCell>
                  <TableCell>{new Date(invoice.receivedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                        <Eye className="size-4" />
                      </Button>
                      {invoice.status === "Pending Approval" && (
                        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setCurrentInvoice(invoice)}>
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Invoice</DialogTitle>
                              <DialogDescription>
                                Review and approve or reject invoice {currentInvoice?.invoiceNumber}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Company</p>
                                  <p className="font-medium">{currentInvoice?.companyName}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Amount</p>
                                  <p className="font-medium">${currentInvoice?.invoiceTotal.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => currentInvoice && handleApprovalAction(currentInvoice, "Rejected")}
                              >
                                <X className="size-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => currentInvoice && handleApprovalAction(currentInvoice, "Approved")}
                              >
                                <Check className="size-4 mr-2" />
                                Approve
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {invoice.status === "Approved" && invoice.activityType === "Pending" && (
                        <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setCurrentInvoice(invoice)}>
                              Update Activity
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Activity Type</DialogTitle>
                              <DialogDescription>
                                Select the activity type for invoice {currentInvoice?.invoiceNumber}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select activity type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Complete">Complete</SelectItem>
                                  <SelectItem value="Reimbursable">Reimbursable</SelectItem>
                                  <SelectItem value="Deal Allocation">Deal Allocation</SelectItem>
                                  <SelectItem value="Out of FM">Out of FM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={() =>
                                  currentInvoice && handleActivityTypeUpdate(currentInvoice, selectedActivityType)
                                }
                              >
                                Update
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
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
