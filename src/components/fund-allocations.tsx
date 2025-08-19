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
import { Fund, Operation } from "@/lib/definitions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { operateData } from "@/lib/utils"

interface FundAllocationsProps {
  onFundsUpdate?: (funds: Fund[]) => void
}

const initialFunds: Fund[] = operateData(Operation.Read, "funds") as Fund[]

export function FundAllocations({ onFundsUpdate }: FundAllocationsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [funds, setFunds] = useState<Fund[]>(initialFunds)
  const [editingFund, setEditingFund] = useState<Fund | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fundToDelete, setFundToDelete] = useState<Fund | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Form state for editing/adding funds
  const [formData, setFormData] = useState({
    name: "",
    aum: "",
    // status: "Active" as Fund["status"],
    manager: "",
  })

  const filteredFunds = funds.filter((fund) => {
    const matchesSearch =
      fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.manager.toLowerCase().includes(searchTerm.toLowerCase())
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

  const totalAUM = filteredFunds.reduce((sum, fund) => sum + fund.aum, 0)
  // const activeFunds = filteredFunds.filter((fund) => fund.status === "Active").length

  const handleEditFund = (fund: Fund) => {
    setEditingFund(fund)
    setFormData({
      name: fund.name,
      aum: formatCurrencyInput(fund.aum.toString()),
      // status: fund.status,
      manager: fund.manager,
    })
    setValidationErrors([])
    setEditDialogOpen(true)
  }

  const handleAddFund = () => {
    setEditingFund(null)
    setFormData({
      name: "",
      aum: "",
      // status: "Active",
      manager: "",
    })
    setValidationErrors([])
    setAddDialogOpen(true)
  }

  const handleDeleteFund = (fund: Fund) => {
    setFundToDelete(fund)
    setDeleteDialogOpen(true)
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.name.trim()) errors.push("Fund name is required")
    if (!formData.aum.trim()) errors.push("AUM value is required")
    if (!formData.manager.trim()) errors.push("Manager name is required")

    // Check for duplicate fund names (except when editing the same fund)
    const existingFund = funds.find(
      (fund) => fund.name.toLowerCase() === formData.name.toLowerCase() && fund.id !== editingFund?.id,
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

  const handleSaveFund = () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    const aumValue = parseAUMValue(formData.aum)
    const currentDate = new Date().toISOString().split("T")[0]

    if (editingFund) {
      // Update existing fund
      const updatedFund: Fund = {
        ...editingFund,
        name: formData.name.trim(),
        aum: aumValue,
        // status: formData.status,
        manager: formData.manager.trim(),
        lastUpdated: currentDate,
      }

      setFunds((prev) => prev.map((fund) => (fund.id === editingFund.id ? updatedFund : fund)))
      setEditDialogOpen(false)
    } else {
      // Add new fund
      const newFund: Fund = {
        id: `fund-${Date.now()}`,
        name: formData.name.trim(),
        aum: aumValue,
        // status: formData.status,
        manager: formData.manager.trim(),
        lastUpdated: currentDate,
      }

      setFunds((prev) => [...prev, newFund])
      setAddDialogOpen(false)
    }

    // Call callback if provided
    if (onFundsUpdate) {
      onFundsUpdate(funds)
    }

    setValidationErrors([])
  }

  const confirmDeleteFund = () => {
    if (fundToDelete) {
      setFunds((prev) => prev.filter((fund) => fund.id !== fundToDelete.id))
      setDeleteDialogOpen(false)
      setFundToDelete(null)

      // Call callback if provided
      if (onFundsUpdate) {
        onFundsUpdate(funds.filter((fund) => fund.id !== fundToDelete.id))
      }
    }
  }

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
          <h1 className="2xl:text-3xl sm:text-2xl font-bold tracking-tight">Fund Allocations</h1>
          <p className="text-muted-foreground">Manage fund portfolios and AUM values</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddFund} className="text-base sm:text-sm cursor-pointer">
            <Plus className="2xl:size-5 sm:size-4 mr-2" />
            Add Fund
          </Button>
          <Button variant="outline" className="2xl:text-base sm:text-sm cursor-pointer" onClick={() => operateData(Operation.Read, "funds")}>
            <Download className="2xl:size-5 sm:size-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="2xl:text-base sm:text-sm font-medium -mb-1">Total Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="2xl:text-3xl sm:text-2xl font-bold">{filteredFunds.length}</div>
            <p className="2xl:text-sm sm:text-xs text-muted-foreground">Managed funds</p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm sm:text-xs font-medium">Active Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFunds}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card> */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="2xl:text-base sm:text-sm font-medium -mb-1">Total AUM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="2xl:text-3xl sm:text-2xl font-bold">{formatCurrency(totalAUM)}</div>
            <p className="2xl:text-sm sm:text-xs text-muted-foreground">Assets under management</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="2xl:text-xl sm:text-lg">Fund Portfolio</CardTitle>
              <CardDescription className="2xl:text-base sm:text-sm">View and manage all fund allocations and AUM values</CardDescription>
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
          <Table className="2xl:text-base sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Fund Name</TableHead>
                <TableHead>AUM</TableHead>
                {/* <TableHead>Status</TableHead> */}
                <TableHead>Manager</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFunds.map((fund) => (
                <TableRow key={fund.id}>
                  <TableCell className="font-medium">{fund.name}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(fund.aum)}</TableCell>
                  {/* <TableCell>{getStatusBadge(fund.status)}</TableCell> */}
                  <TableCell>{fund.manager}</TableCell>
                  <TableCell>{new Date(fund.lastUpdated).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditFund(fund)}>
                        <Edit className="2xl:size-4.5 size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFund(fund)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="2xl:size-4.5 size-4" />
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
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFund}>
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
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFund}>
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
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFund}>
              <Trash2 className="size-4 mr-2" />
              Delete Fund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
