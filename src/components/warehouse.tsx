"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Eye, ArrowLeft, Check, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Status, ActivityType, Invoice, Fund, FundDetailed, Operation, DealFund, Deal } from "@/lib/definitions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { statusBadge, activityTypeBadge, operateData } from "@/lib/utils"

const allFunds: Fund[] = operateData(Operation.Read, "funds") as Fund[]
const deals: Deal[] = operateData(Operation.Read, "deals") as Deal[]

const generateFunds = (invoiceTotal: number, funds: Fund[]): FundDetailed[] => {
  const totalAUM = 4123000000 // $4.123B

  return funds.map((fund, index) => {
    const id = fund.id
    const name = fund.name
    const aum = fund.aum
    const percentage = (aum / totalAUM) * 100
    const amountAllocated = (percentage / 100) * invoiceTotal

    console.log(amountAllocated)

    return {
      id,
      name,
      aum,
      percentage,
      amountAllocated,
    }
  })
}

const generateDealFunds = (invoiceTotal: number, totalDealAUM: number, funds: DealFund[]): FundDetailed[] => {
  // const totalAUM = 4123000000 // $4.123B

  return funds.map((dealFund, index) => {
    const fund: Fund = allFunds.find(curFund => curFund.id === dealFund.fundId)!

    const id = fund.id
    const name = fund.name
    const aum = dealFund.fundAmount
    const percentage = (aum / totalDealAUM) * 100
    const amountAllocated = (percentage / 100) * invoiceTotal

    // console.log(percentage)
    // console.log(amountAllocated)

    return {
      id,
      name,
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
  const [invoices, setInvoices] = useState<Invoice[]>(propInvoices!)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [funds, setFunds] = useState<FundDetailed[]>([])
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [selectedActivityType, setSelectedActivityType] = useState(ActivityType.Pending)
  const [invoiceDeal, setInvoiceDeal] = useState<Deal | null>(null)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalInvoiceAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.invoiceTotal, 0)

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    console.log(invoice.dealId)
    if (invoice.activityType === ActivityType.DealAlloc) {
      console.log("deal invoice selected")
      const deal: Deal = deals.find(deal => deal.id === invoice.dealId)!
      setInvoiceDeal(deal)
      setFunds(generateDealFunds(invoice.invoiceTotal, deal.amount, deal.funds))
    } else {
      console.log("regular invoice selected")
      setFunds(generateFunds(invoice.invoiceTotal, allFunds))
    }
  }

  const returnWarehouse = () => {
    setSelectedInvoice(null)
    setFunds([])
  }

  const updateApproval = (invoice: Invoice, action: Status.Approved | Status.Rejected) => {
    const updatedInvoice = { ...invoice, status: action }
    updateInvoice(updatedInvoice)
    setApprovalDialogOpen(false)
  }

  const updateActivity = (invoice: Invoice, activityType: ActivityType) => {
    const updatedInvoice = {
      ...invoice,
      activityType,
      status: activityType === ActivityType.Pending ? Status.Approved : Status.Complete,
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

  const formatCurrency = (amount: number, full: boolean = false) => {
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
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={returnWarehouse} className="2xl:text-base sm:text-sm cursor-pointer">
            <ArrowLeft className="2xl:size-5 sm:size-4" />
            Back to Invoice Warehouse
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="2xl:text-3xl sm:text-2xl font-bold tracking-tight">Allocation Table</h1>
            <p className="text-muted-foreground">Detailed fund allocations for {selectedInvoice.invoiceNumber}</p>
          </div>
          <Button className="2xl:text-base sm:text-sm cursor-pointer">
            <Download className="2xl:size-5 sm:size-4 mr-1" />
            Export Allocations
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="2xl:text-base sm:text-sm font-medium -mb-1">Invoice Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="2xl:text-3xl sm:text-xl font-bold">{formatCurrency(selectedInvoice.invoiceTotal)}</div>
              <p className="2xl:text-sm sm:text-xs text-muted-foreground">Total invoice amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="2xl:text-base sm:text-sm font-medium -mb-1">Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="2xl:text-3xl sm:text-xl font-bold">{selectedInvoice.companyName}</div>
              <p className="2xl:text-sm sm:text-xs text-muted-foreground">Invoice issuer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="2xl:text-base sm:text-sm font-medium -mb-1">Received Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="2xl:text-3xl sm:text-xl font-bold">{new Date(selectedInvoice.receivedDate).toLocaleDateString()}</div>
              <p className="2xl:text-sm sm:text-xs text-muted-foreground">Date received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="2xl:text-base sm:text-sm font-medium -mb-1">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="2xl:text-3xl sm:text-xl font-bold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
              <p className="2xl:text-sm sm:text-xs text-muted-foreground">Payment due</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="2xl:text-xl sm:text-lg -mb-1">Fund Allocations</CardTitle>
            <CardDescription className="2xl:text-base sm:text-sm">Breakdown of allocations across all funds</CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="2xl:text-base sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Fund</TableHead>
                  <TableHead>AUM</TableHead>
                  {/* <TableHead>Percentage <Eye className="size-5"/></TableHead> */}
                  <TableHead>Percentage</TableHead>
                  <TableHead>Amount Allocated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds.map((fund) => (
                  <TableRow key={fund.id}>
                    <TableCell className="font-medium">{fund.name}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(fund.aum)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-3 sm:h-2">
                          <div
                            className="bg-blue-600 h-3 sm:h-2 rounded-full"
                            style={{ width: `${Math.min(fund.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="2xl:text-base sm:text-sm">{fund.percentage.toFixed(3)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(fund.amountAllocated)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <div className="w-fit space-y-2">
                <div className="flex justify-between text-base sm:text-sm">
                  <span>Total {invoiceDeal !== null ? "Deal" : ""} AUM:</span>
                  <span>{invoiceDeal !== null ? formatCurrency(invoiceDeal.amount) : "$4.123B"}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg sm:text-base gap-4">
                  <span>Total Allocated:</span>
                  <span>{formatCurrency(totalAllocated)}</span>
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
          <h1 className="2xl:text-3xl sm:text-2xl font-bold tracking-tight">Invoice Warehouse</h1>
          <p className="text-muted-foreground">Manage and track invoices across the warehouse</p>
        </div>
        <Button className="2xl:text-base sm:text-sm">
          <Download className="2xl:size-5 sm:size-4 mr-1" />
          Export Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="2xl:text-base sm:text-sm font-medium -mb-1">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="2xl:text-3xl sm:text-2xl font-bold">{filteredInvoices.length}</div>
            <p className="2xl:text-sm sm:text-xs text-muted-foreground">Active invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="2xl:text-base sm:text-sm font-medium -mb-1">Total AUM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="2xl:text-3xl sm:text-2xl font-bold">$4.123B</div>
            <p className="2xl:text-sm sm:text-xs text-muted-foreground">Assets under management</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="2xl:text-base sm:text-sm font-medium -mb-1">Invoice Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="2xl:text-3xl sm:text-2xl font-bold">${totalInvoiceAmount.toLocaleString()}</div>
            <p className="2xl:text-sm sm:text-xs text-muted-foreground">Total invoice amount</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="2xl:text-xl sm:text-lg">Invoice Warehouse</CardTitle>
              <CardDescription className="2xl:text-base sm:text-sm">View and manage all invoices in the warehouse</CardDescription>
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
                <SelectTrigger className="w-50">
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="2xl:text-base sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Invoice Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity Type</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.companyName}</TableCell>
                  <TableCell className="font-medium">${invoice.invoiceTotal.toLocaleString()}</TableCell>
                  <TableCell>{statusBadge(invoice.status)}</TableCell>
                  <TableCell>{activityTypeBadge(invoice.activityType)}</TableCell>
                  <TableCell>{new Date(invoice.receivedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-start gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                        <Eye className="2xl:size-4.5 size-4" />
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
                                onClick={() => currentInvoice && updateApproval(currentInvoice, Status.Rejected)}
                              >
                                <X className="size-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => currentInvoice && updateApproval(currentInvoice, Status.Approved)}
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
                              <Select value={selectedActivityType === ActivityType.Pending ? undefined : selectedActivityType} onValueChange={(value) => setSelectedActivityType(value as ActivityType)}>
                                <SelectTrigger className="w-[280px]">
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
                                  currentInvoice && updateActivity(currentInvoice, selectedActivityType)
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
