import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Operation, Fund, Deal, DealStatus, Status, Invoice, ActivityType } from "@/lib/definitions"
import data from "@/lib/data.json"
import { Badge } from "@/components/ui/badge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function operateData(op: Operation, entity: "deals" | "funds" | "invoices"): Fund[] | Deal[] | Invoice[] {

  const collection: Deal[] | Fund[] | Invoice[] = data[entity] as Fund[] | Deal[] | Invoice[]

  switch (op) {
    case Operation.Create:
      // create operation
      return []
    case Operation.Read:
      // read operation
      return collection
    case Operation.Update:
      // update operation
      return []
    case Operation.Delete:
      // delete operation
      return []
  }
}

export function dealStatusBadge(status: DealStatus) {
  switch (status) {
    case DealStatus.Active:
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-sm sm:text-xs">Active</Badge>
    case DealStatus.Inactive:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 text-sm sm:text-xs">Inactive</Badge>
    default:
      return <Badge variant="secondary" className="text-sm sm:text-xs">{status}</Badge>
  }
}

export function statusBadge(status: Status) {
  switch (status) {
    case Status.PendingApproval:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-sm sm:text-xs">Pending Approval</Badge>
    case Status.Approved:
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm sm:text-xs">Approved</Badge>
    case Status.Complete:
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-sm sm:text-xs">Completed</Badge>
    case Status.Rejected:
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-sm sm:text-xs">Rejected</Badge>
    default:
      return <Badge variant="secondary" className="text-sm sm:text-xs">{status}</Badge>
  }
}

export function activityTypeBadge(activityType: ActivityType) {
    switch (activityType) {
      case ActivityType.Pending:
        return <Badge variant="outline">Pending</Badge>
      case ActivityType.Complete:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-sm sm:text-xs">Complete</Badge>
      case ActivityType.Reimb:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm sm:text-xs">Reimbursable</Badge>
      case ActivityType.DealAlloc:
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-sm sm:text-xs">Deal Allocation</Badge>
      case ActivityType.FM:
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-sm sm:text-xs">Out of FM</Badge>
      default:
        return <Badge variant="secondary" className="text-sm sm:text-xs">{activityType}</Badge>
    }
  }