"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Upload, FileText, X, CheckCircle, Save, Send, CalendarIcon, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn, operateData } from "@/lib/utils"
import { format } from "date-fns"
import { ActivityType, Deal, Invoice, Operation, Status } from "@/lib/definitions"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"

interface UploadedFile {
  name: string
  size: number
  type: string
  lastModified: number
}

interface InvoiceData {
  invoiceNumber: string
  companyName: string
  receivedDate: string
  dueDate: string
  totalAmount: string
  activityType: ActivityType
  dealId?: string
}

interface NewInvoiceProps {
  createInvoice?: (invoice: Invoice) => void
  existingInvoices?: Invoice[]
}

const deals: Deal[] = operateData(Operation.Read, "deals") as Deal[]

export function NewInvoice({ createInvoice, existingInvoices = [] }: NewInvoiceProps) {
  const [activeTab, setActiveTab] = useState("manual")
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receivedDate, setReceivedDate] = useState<Date>()
  const [dueDate, setDueDate] = useState<Date>()
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    companyName: "",
    receivedDate: "",
    dueDate: "",
    totalAmount: "",
    activityType: ActivityType.Pending,
    dealId: undefined
  })

  // File upload handlers
  const handleFileUpload = (file: File) => {
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    })

    // Simulate processing and data extraction
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      // Simulate extracted data
      const extractedReceivedDate = new Date("2024-01-15")
      const extractedDueDate = new Date("2024-02-15")

      setInvoiceData({
        invoiceNumber: "INV-2024-001",
        companyName: "Acme Corporation",
        receivedDate: "2024-01-15",
        dueDate: "2024-02-15",
        totalAmount: "1250.00",
        activityType: ActivityType.Complete
      })
      setReceivedDate(extractedReceivedDate)
      setDueDate(extractedDueDate)
    }, 2000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const removeUploadedFile = () => {
    setUploadedFile(null)
    setIsProcessing(false)
    setInvoiceData({
      invoiceNumber: "",
      companyName: "",
      receivedDate: "",
      dueDate: "",
      totalAmount: "",
      activityType: ActivityType.Pending
    })
    setReceivedDate(undefined)
    setDueDate(undefined)
    setValidationErrors([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleInputChange = (field: keyof InvoiceData, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear validation errors when user starts typing
    setValidationErrors([])
  }

  const setInvoiceActivity = (value: ActivityType) => {
    if (value === invoiceData.activityType) {
      console.log("resetting activityType")
      setInvoiceData((form) => ({
        ...form,
        activityType: ActivityType.Pending
      }))
    } else {
      console.log("setting activityType " + value)
      setInvoiceData((form) => ({
        ...form,
        activityType: value
      }))
    }
  }

  const setInvoiceDeal = (value: string) => {
    setInvoiceData((form) => ({
      ...form,
      dealId: value
    }))
  }

  const formatCurrency = (value: string) => {
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

  const handleCurrencyChange = (value: string) => {
    const formatted = formatCurrency(value)
    handleInputChange("totalAmount", formatted)
  }

  const handleDateChange = (field: "receivedDate" | "dueDate", date: Date | undefined) => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd")
      handleInputChange(field, dateString)
      if (field === "receivedDate") {
        setReceivedDate(date)
      } else {
        setDueDate(date)
      }
      // Clear validation errors when date changes
      setValidationErrors([])
    }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!invoiceData.invoiceNumber) errors.push("Invoice number is required")
    if (!invoiceData.companyName) errors.push("Company name is required")
    if (!invoiceData.receivedDate) errors.push("Received date is required")
    if (!invoiceData.dueDate) errors.push("Due date is required")
    if (!invoiceData.totalAmount) errors.push("Total amount is required")
    if (invoiceData.activityType === ActivityType.Pending) errors.push("Activity type is required")
    if (invoiceData.activityType === ActivityType.DealAlloc && !invoiceData.dealId) errors.push("Activity type is required")

    // Check if due date is before received date
    if (receivedDate && dueDate && dueDate < receivedDate) {
      errors.push("Due date cannot be earlier than received date")
    }

    // Check for duplicate invoice numbers (except for rejected invoices)
    const existingInvoice = existingInvoices.find((inv) => inv.invoiceNumber === invoiceData.invoiceNumber)
    if (existingInvoice && existingInvoice.status !== "Rejected") {
      errors.push("Invoice number already exists. Only rejected invoices can be replaced.")
    }

    return errors
  }

  const isFormValid = () => {
    return validateForm().length === 0
  }

  const handleSave = () => {
    const errors = validateForm()
    if (errors.length === 0) {
      console.log("Saving invoice:", invoiceData)
      // Here you would typically save to your database
    } else {
      setValidationErrors(errors)
    }
  }

  const handleSubmit = () => {
    const errors = validateForm()
    if (errors.length === 0) {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: invoiceData.invoiceNumber,
        companyName: invoiceData.companyName,
        invoiceTotal: Number.parseFloat(invoiceData.totalAmount.replace(/[^\d.]/g, "")),
        status: Status.PendingApproval,
        activityType: invoiceData.activityType,
        receivedDate: invoiceData.receivedDate,
        dueDate: invoiceData.dueDate,
        ...(invoiceData.dealId && {dealId: invoiceData.dealId})
      }

      // Call the callback to add the invoice to the warehouse
      if (createInvoice) {
        createInvoice(newInvoice)
      }

      // Reset form
      setInvoiceData({
        invoiceNumber: "",
        companyName: "",
        receivedDate: "",
        dueDate: "",
        totalAmount: "",
        activityType: ActivityType.Pending
      })
      setReceivedDate(undefined)
      setDueDate(undefined)
      setUploadedFile(null)
      setIsProcessing(false)
      setValidationErrors([])

      console.log("Invoice created:", newInvoice)
    } else {
      setValidationErrors(errors)
    }
  }

  return (
    <div className="space-y-6 p-6 text-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-2xl font-bold tracking-tight">New Invoice</h1>
          <p className="text-muted-foreground">Upload an invoice file or enter details manually</p>
        </div>
        <Badge variant="secondary" className="text-sm sm:text-xs">
          Draft
        </Badge>
      </div>

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-fit">
          <TabsTrigger value="manual" className="flex items-center gap-2 text-base sm:text-sm">
            <FileText className="size-5 sm:size-4" />
            Manual Input
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2 text-base sm:text-sm">
            <Upload className="size-5 sm:size-4" />
            Invoice File Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-xl sm:text-lg">Invoice Information</CardTitle>
                <CardDescription className="text-base sm:text-sm">Enter the essential invoice details manually</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-invoice" className="text-base sm:text-sm">Invoice Number</Label>
                  <Input
                    id="manual-invoice"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                    placeholder="Enter invoice number"
                    className="sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-company" className="text-base sm:text-sm">Company Name</Label>
                  <Input
                    id="manual-company"
                    value={invoiceData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter company name"
                    className="sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-total" className="text-base sm:text-sm">Total Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground sm:text-sm">$</span>
                    <Input
                      id="manual-total"
                      value={invoiceData.totalAmount}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                      placeholder="0.00"
                      className="pl-8 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-base sm:text-sm">Received Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !receivedDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        <span className="text-base sm:text-sm">{receivedDate ? format(receivedDate, "PPP") : "Select Date"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={receivedDate}
                        onSelect={(date) => handleDateChange("receivedDate", date)}
                        captionLayout="dropdown"
                        // components={{
                        //   YearsDropdown: ({ value, onChange, options, ...props }) => {
                        //     // const options = React.Children.toArray(children) as React.ReactElement[]

                        //     return (
                        //       <Select
                        //         value={value?.toString()}
                        //         onValueChange={(newValue) => {
                        //           const changeEvent = {
                        //             target: { value: newValue }
                        //           } as React.ChangeEvent<HTMLSelectElement>
                        //           onChange?.(changeEvent)
                        //         }}
                        //       >
                        //         <SelectTrigger className="w-32 h-8">
                        //           <SelectValue />
                        //         </SelectTrigger>
                        //         <SelectContent>
                        //           {options?.map((option, index) => (
                        //             <SelectItem
                        //               key={option.value}
                        //               value={option.value.toString()}
                        //               className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer"
                        //             >
                        //               {option.label}
                        //             </SelectItem>
                        //           ))}
                        //         </SelectContent>
                        //       </Select>
                        //     )
                        //   }
                        // }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-base sm:text-sm">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        <span className="text-base sm:text-sm">{dueDate ? format(dueDate, "PPP") : "Select Date"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => handleDateChange("dueDate", date)}
                        captionLayout="dropdown"
                        disabled={(date) => (receivedDate ? date < receivedDate : false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-base sm:text-sm">Activity Type</Label>
                  <Select value={invoiceData.activityType !== ActivityType.Pending ? invoiceData.activityType : undefined} onValueChange={(value) => setInvoiceActivity(value as ActivityType)}>
                    <SelectTrigger className="w-full text-base sm:text-sm">
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Activity Types</SelectLabel>
                        {Object.values(ActivityType).filter((activity) => activity !== ActivityType.Pending).map((activity) => (
                          <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {invoiceData.activityType === ActivityType.DealAlloc && (<div className="space-y-2">
                  <Label className="text-base sm:text-sm">Deal Involved</Label>
                  <Select value={invoiceData.dealId} onValueChange={setInvoiceDeal}>
                    <SelectTrigger className="w-full text-base sm:text-sm">
                      <SelectValue placeholder="Select deal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Deals</SelectLabel>
                        {Object.values(deals).map((deal) => (
                          <SelectItem key={deal.id} value={deal.id}>{deal.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>)}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            {/* <Button variant="outline" onClick={handleSave}>
              <Save className="size-4 mr-2" />
              Save Draft
            </Button> */}
            <Button onClick={handleSubmit} className="cursor-pointer text-base sm:text-sm">
              {/* <Send className="size-4 mr-2" /> */}
              <Save className="size-5 sm:size-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Invoice File</CardTitle>
              <CardDescription>Upload an invoice file to automatically extract key information</CardDescription>
            </CardHeader>
            <CardContent>
              {!uploadedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="size-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Drop your invoice file here</h3>
                  <p className="text-muted-foreground mb-4">or click to browse your files</p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="size-8 text-primary" />
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(uploadedFile.size)} • {uploadedFile.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isProcessing ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="size-4" />
                          <span className="text-sm">Ready</span>
                        </div>
                      )}
                      <Button variant="ghost" size="sm" onClick={removeUploadedFile}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {uploadedFile && !isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Invoice Information</CardTitle>
                <CardDescription>Review and edit the information extracted from your uploaded file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="extracted-invoice">Invoice Number</Label>
                    <Input
                      id="extracted-invoice"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                      placeholder="Enter invoice number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extracted-company">Company Name</Label>
                    <Input
                      id="extracted-company"
                      value={invoiceData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extracted-total">Total Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="extracted-total"
                        value={invoiceData.totalAmount}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Received Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !receivedDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {receivedDate ? format(receivedDate, "PPP") : <span>Select Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={receivedDate}
                          onSelect={(date) => handleDateChange("receivedDate", date)}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : <span>Select Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={(date) => handleDateChange("dueDate", date)}
                          disabled={(date) => (receivedDate ? date < receivedDate : false)}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {uploadedFile && !isProcessing && (
            <div className="flex justify-end gap-4">
              <Button onClick={handleSubmit} className="cursor-pointer">
                <Save className="size-4 mr-2" />
                Save Invoice
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      {isFormValid() && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-xl">Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
              <div>
                <p className="text-muted-foreground">Invoice #</p>
                <p className="font-medium">{invoiceData.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">{invoiceData.companyName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-medium">${invoiceData.totalAmount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">Pending Approval</p>
              </div>
              <div>
                <p className="text-muted-foreground">Received</p>
                <p className="font-medium">{receivedDate ? format(receivedDate, "PPP") : invoiceData.receivedDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due</p>
                <p className="font-medium">{dueDate ? format(dueDate, "PPP") : invoiceData.dueDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Activity Type</p>
                <p className="font-medium">{invoiceData.activityType}</p>
              </div>
              {invoiceData.activityType === ActivityType.DealAlloc && invoiceData.dealId && (
                <div>
                  <p className="text-muted-foreground">Deal</p>
                  <p className="font-medium">{deals.find(deal => deal.id === invoiceData.dealId)?.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
