"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { NewInvoice } from "@/components/new-invoice"
import { Warehouse } from "@/components/warehouse"
import { FundAllocations } from "@/components/fund-allocations"

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

export default function Page() {
  const [activeView, setActiveView] = useState("new-invoice")
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const handleInvoiceCreated = (newInvoice: Invoice) => {
    // Check if there's an existing rejected invoice with the same number
    const existingRejectedIndex = invoices.findIndex(
      (inv) => inv.invoiceNumber === newInvoice.invoiceNumber && inv.status === "Rejected",
    )

    if (existingRejectedIndex !== -1) {
      // Replace the rejected invoice
      setInvoices((prev) => prev.map((inv, index) => (index === existingRejectedIndex ? newInvoice : inv)))
    } else {
      // Add new invoice
      setInvoices((prev) => [...prev, newInvoice])
    }

    setActiveView("allocations") // Switch to warehouse view to show the new invoice
  }

  const handleInvoiceUpdate = (updatedInvoice: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)))
  }

  const renderContent = () => {
    switch (activeView) {
      case "new-invoice":
        return <NewInvoice onInvoiceCreated={handleInvoiceCreated} existingInvoices={invoices} />
      case "allocations":
        return <Warehouse invoices={invoices} onInvoiceUpdate={handleInvoiceUpdate} />
      case "fund-allocations":
        return <FundAllocations />
      default:
        return <NewInvoice onInvoiceCreated={handleInvoiceCreated} existingInvoices={invoices} />
    }
  }

  const getPageTitle = () => {
    switch (activeView) {
      case "new-invoice":
        return "New Invoice"
      case "allocations":
        return "Invoice Warehouse"
      case "fund-allocations":
        return "Fund Allocations"
      default:
        return "New Invoice"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} setActiveView={setActiveView} />
      {/* <SidebarInset> */}
      <header>
        <SidebarTrigger />
        {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
        {/* <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">{getPageTitle()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb> */}
      </header>
      <div className="mt-16 flex flex-1 flex-col gap-4 p-4 pt-0">{renderContent()}</div>
      {/* </SidebarInset> */}
    </SidebarProvider>
  )
}
