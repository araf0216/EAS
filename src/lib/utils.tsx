import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Operation, Fund, Deal, DealStatus, Status } from "@/lib/definitions"
import data from "@/lib/data.json"
import { Badge } from "@/components/ui/badge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function operateData(op: Operation, entity: "deals" | "funds"): Fund[] | Deal[] {

  const collection: Deal[] | Fund[] = entity === "deals" ? data["deals"] as Deal[] : data["funds"] as Fund[]

  // if (entity === "deals") {
  //   const collection: Deal[] = []
  // } else {
  //   const collection: Fund[] = []
  // }

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
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    case DealStatus.Inactive:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function statusBadge(status: Status) {
  switch (status) {
    case Status.PendingApproval:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Approval</Badge>
    case Status.Approved:
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Approved</Badge>
    case Status.Complete:
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    case Status.Rejected:
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}