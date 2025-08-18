export enum Status {
  PendingApproval = "Pending Approval",
  Approved = "Approved",
  Rejected = "Rejected",
  Complete = "Complete"
}

export enum ActivityType {
  Pending = "Pending",
  Reimb = "Reimbursable",
  DealAlloc = "Deal Allocation",
  FM = "Out of FM",
  Complete = "Complete"
}

export enum DealStatus {
  Active = "Active",
  Inactive = "Inactive"
}

export enum Operation {
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete"
}

export interface Invoice {
  id: string
  invoiceNumber: string
  companyName: string
  invoiceTotal: number
  status: Status
  activityType: ActivityType
  receivedDate: string
  dueDate: string
  dealId?: string
}

export interface Fund {
  id: string
  name: string
  aum: number
  lastUpdated: string
  manager: string
}

export interface FundDetailed {
  id: string
  name: string
  aum: number
  percentage: number
  amountAllocated: number
}

export interface Deal {
  id: string
  name: string
  amount: number
  status: DealStatus
  manager: string
  funds: DealFund[]
}

export interface DealFund {
  fundId: string
  fundAmount: number
}

// export const initialDeals: Deal[] = [
//   {
//     id: "deal-1",
//     name: "Deal Sierra",
//     amount: 85000000,
//     status: DealStatus.Active,
//     // lastUpdated: "2024-01-15",
//     manager: "Hamza Ass Sam",
//     funds: []
//   },
//   {
//     id: "deal-2",
//     name: "Deal Tango",
//     amount: 72000000,
//     status: DealStatus.Active,
//     // lastUpdated: "2024-01-14",
//     manager: "Rick Shirt, LXIX",
//     funds: []
//   },
//   {
//     id: "deal-3",
//     name: "Deal Uniform",
//     amount: 65000000,
//     status: DealStatus.Active,
//     // lastUpdated: "2024-01-13",
//     manager: "Ray Durango",
//     funds: []
//   },
//   {
//     id: "deal-4",
//     name: "Deal Victor",
//     amount: 58000000,
//     status: DealStatus.Active,
//     // lastUpdated: "2024-01-12",
//     manager: "Camera Hunt",
//     funds: []
//   },
//   {
//     id: "deal-5",
//     name: "Deal Whiskey",
//     amount: 50000000,
//     status: DealStatus.Active,
//     // lastUpdated: "2024-01-11",
//     manager: "Sid Trip",
//     funds: []
//   },
//   {
//     id: "deal-6",
//     name: "Deal X-Ray",
//     amount: 42000000,
//     status: DealStatus.Inactive,
//     // lastUpdated: "2024-01-10",
//     manager: "Araf Alpha",
//     funds: []
//   },
//   {
//     id: "deal-7",
//     name: "Deal Yankee",
//     amount: 25000000,
//     status: DealStatus.Active,
//     // lastUpdated: "2024-01-09",
//     manager: "Sara Human",
//     funds: []
//   },
//   {
//     id: "deal-8",
//     name: "Deal Zeus",
//     amount: 15300000,
//     status: DealStatus.Active,
//     // lastUpdated: "2024-01-08",
//     manager: "Gavin Regularly",
//     funds: []
//   },
// ]

// export const initialFunds: Fund[] = [
//   {
//     id: "fund-1",
//     name: "Fund Alpha",
//     aum: 850000000,
//     // status: "Active",
//     lastUpdated: "2024-01-15",
//     manager: "Hamza Ass Sam",
//   },
//   {
//     id: "fund-2",
//     name: "Fund Bravo",
//     aum: 720000000,
//     // status: "Active",
//     lastUpdated: "2024-01-14",
//     manager: "Rick Shirt, LXIX",
//   },
//   {
//     id: "fund-3",
//     name: "Fund Charlie",
//     aum: 650000000,
//     // status: "Active",
//     lastUpdated: "2024-01-13",
//     manager: "Ray Durango",
//   },
//   {
//     id: "fund-4",
//     name: "Fund Delta",
//     aum: 580000000,
//     // status: "Active",
//     lastUpdated: "2024-01-12",
//     manager: "Camera Hunt",
//   },
//   {
//     id: "fund-5",
//     name: "Fund Echo",
//     aum: 500000000,
//     // status: "Active",
//     lastUpdated: "2024-01-11",
//     manager: "Sid Trip",
//   },
//   {
//     id: "fund-6",
//     name: "Fund Foxtrot",
//     aum: 420000000,
//     // status: "Inactive",
//     lastUpdated: "2024-01-10",
//     manager: "Araf Alpha",
//   },
//   {
//     id: "fund-7",
//     name: "Fund Golf",
//     aum: 250000000,
//     // status: "Active",
//     lastUpdated: "2024-01-09",
//     manager: "Sara Human",
//   },
//   {
//     id: "fund-8",
//     name: "Fund Hotel",
//     aum: 153000000,
//     // status: "Pending",
//     lastUpdated: "2024-01-08",
//     manager: "Gavin Regularly",
//   },
// ]