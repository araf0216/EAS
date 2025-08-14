"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, Edit, Save, Plus, Trash2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Deal, Fund, initialFunds, Operation } from "@/lib/definitions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { dealStatusBadge, operateData } from "@/lib/utils"

interface FundAllocationsProps {
  onFundsUpdate?: (funds: Fund[]) => void
}

export function DealAllocations({ onFundsUpdate }: FundAllocationsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deals, setDeals] = useState<Deal[]>(operateData(Operation.Read, "deals") as Deal[])
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fundToDelete, setFundToDelete] = useState<Fund | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    aum: "",
    // status: "Active" as Fund["status"],
    manager: "",
  })

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.manager.toLowerCase().includes(searchTerm.toLowerCase())
    // const matchesStatus = statusFilter === "all" || fund.status === statusFilter
    return matchesSearch
  })

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(3)}B`
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    } else {
      return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  }

  const formatCurrencyInput = (value: string) => {
    // Remove all non-digit characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, "")

    // Split by decimal point
    const parts = numericValue.split(".")

    // Format the integer part with commas
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    // Limit decimal part to 2 digits
    const decimalPart = parts[1] ? parts[1].substring(0, 2) : ""

    // Combine parts
    let formatted = integerPart
    if (parts.length > 1) {
      formatted += "." + decimalPart
    }

    return formatted
  }

  const parseAUMValue = (value: string): number => {
    // Remove commas and convert to number
    return Number.parseFloat(value.replace(/,/g, "")) || 0
  }

  const totalAUM = filteredDeals.reduce((sum, deal) => sum + deal.amount, 0)
  // const activeFunds = filteredFunds.filter((fund) => fund.status === "Active").length

  const editDeal = (deal: Deal) => {
    setEditingDeal(deal)
    setFormData({
      name: deal.name,
      aum: formatCurrencyInput(deal.amount.toString()),
      // status: fund.status,
      manager: deal.manager,
    })
    setValidationErrors([])
    setEditDialogOpen(true)
  }

  const handleAddFund = () => {
    setEditingDeal(null)
    setFormData({
      name: "",
      aum: "",
      // status: "Active",
      manager: "",
    })
    setValidationErrors([])
    setAddDialogOpen(true)
  }

  const deleteFund = (fund: Fund) => {
    setFundToDelete(fund)
    setDeleteDialogOpen(true)
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.name.trim()) errors.push("Fund name is required")
    if (!formData.aum.trim()) errors.push("AUM value is required")
    if (!formData.manager.trim()) errors.push("Manager name is required")

    // Check for duplicate fund names (except when editing the same fund)
    const existingFund = deals.find(
      (fund) => fund.name.toLowerCase() === formData.name.toLowerCase() && fund.id !== editingDeal?.id,
    )
    if (existingFund) {
      errors.push("Fund name already exists")
    }

    // Validate AUM value
    const aumValue = parseAUMValue(formData.aum)
    if (aumValue <= 0) {
      errors.push("AUM value must be greater than 0")
    }

    return errors
  }

  // const handleSaveFund = () => {
  //   const errors = validateForm()
  //   if (errors.length > 0) {
  //     setValidationErrors(errors)
  //     return
  //   }

  //   const aumValue = parseAUMValue(formData.aum)
  //   const currentDate = new Date().toISOString().split("T")[0]

  //   if (editingDeal) {
  //     // Update existing fund
  //     const updatedFund: Fund = {
  //       ...editingDeal,
  //       name: formData.name.trim(),
  //       aum: aumValue,
  //       // status: formData.status,
  //       manager: formData.manager.trim(),
  //       lastUpdated: currentDate,
  //     }

  //     setDeals((prev) => prev.map((fund) => (fund.id === editingDeal.id ? updatedFund : fund)))
  //     setEditDialogOpen(false)
  //   } else {
  //     // Add new fund
  //     const newFund: Fund = {
  //       id: `fund-${Date.now()}`,
  //       name: formData.name.trim(),
  //       aum: aumValue,
  //       // status: formData.status,
  //       manager: formData.manager.trim(),
  //       lastUpdated: currentDate,
  //     }

  //     setDeals((prev) => [...prev, newFund])
  //     setAddDialogOpen(false)
  //   }

  //   // Call callback if provided
  //   if (onFundsUpdate) {
  //     onFundsUpdate(deals)
  //   }

  //   setValidationErrors([])
  // }

  // const confirmDeleteFund = () => {
  //   if (fundToDelete) {
  //     setDeals((prev) => prev.filter((fund) => fund.id !== fundToDelete.id))
  //     setDeleteDialogOpen(false)
  //     setFundToDelete(null)

  //     // Call callback if provided
  //     if (onFundsUpdate) {
  //       onFundsUpdate(deals.filter((fund) => fund.id !== fundToDelete.id))
  //     }
  //   }
  // }

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    if (field === "aum") {
      setFormData((prev) => ({ ...prev, [field]: formatCurrencyInput(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
    setValidationErrors([])
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Allocations</h1>
          <p className="text-muted-foreground">Manage investment deals and allocations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="cursor-pointer" onClick={handleAddFund}>
            <Plus className="size-4 mr-2" />
            Add Fund
          </Button>
          <Button className="cursor-pointer" variant="outline">
            <Download className="size-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDeals.length}</div>
            <p className="text-xs text-muted-foreground">Managed deals</p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFunds}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card> */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAUM)}</div>
            <p className="text-xs text-muted-foreground">Total amount managed through deals</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Deal Portfolio</CardTitle>
              <CardDescription>View and manage all investment deals and allocations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search funds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Name</TableHead>
                <TableHead>AUM</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>Last Updated</TableHead> */}
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(deal.amount)}</TableCell>
                  <TableCell>{deal.manager}</TableCell>
                  <TableCell>{dealStatusBadge(deal.status)}</TableCell>
                  {/* <TableCell>{new Date(fund.lastUpdated).toLocaleDateString()}</TableCell> */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* <Button className="cursor-pointer" variant="ghost" size="sm" onClick={() => editFund(fund)}> */}
                      <Button className="cursor-pointer" variant="ghost" size="sm">
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        // onClick={() => deleteFund(fund)}
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Fund Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Fund</DialogTitle>
            <DialogDescription>Update the fund information and AUM value.</DialogDescription>
          </DialogHeader>

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Fund Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Enter fund name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-aum">AUM Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="edit-aum"
                  value={formData.aum}
                  onChange={(e) => handleFormChange("aum", e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="edit-manager">Manager</Label>
              <Input
                id="edit-manager"
                value={formData.manager}
                onChange={(e) => handleFormChange("manager", e.target.value)}
                placeholder="Enter manager name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button className="cursor-pointer" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            {/* <Button className="cursor-pointer" onClick={handleSaveFund}> */}
            <Button className="cursor-pointer">
              <Save className="size-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Fund Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Fund</DialogTitle>
            <DialogDescription>Create a new fund with AUM allocation.</DialogDescription>
          </DialogHeader>

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Fund Name</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Enter fund name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-aum">AUM Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="add-aum"
                  value={formData.aum}
                  onChange={(e) => handleFormChange("aum", e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="add-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="add-manager">Manager</Label>
              <Input
                id="add-manager"
                value={formData.manager}
                onChange={(e) => handleFormChange("manager", e.target.value)}
                placeholder="Enter manager name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button className="cursor-pointer" variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            {/* <Button className="cursor-pointer" onClick={handleSaveFund}> */}
            <Button className="cursor-pointer">
              <Plus className="size-4 mr-2" />
              Add Fund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fund</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{fundToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            {/* <Button className="cursor-pointer" variant="destructive" onClick={confirmDeleteFund}> */}
            <Button className="cursor-pointer" variant="destructive">
              <Trash2 className="size-4 mr-2" />
              Delete Fund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
