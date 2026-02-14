import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye, Search, FileText, CreditCard, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id: string;
  number: string;
  date: Date;
  dueDate: Date;
  amount: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  plan: string;
  paymentMethod: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-001",
    date: new Date("2024-01-15"),
    dueDate: new Date("2024-01-15"),
    amount: 12.0,
    status: "paid",
    plan: "Pro",
    paymentMethod: "Visa •••• 4242",
    items: [{ description: "Pro Monthly Subscription", quantity: 1, unitPrice: 12.0, total: 12.0 }],
  },
  {
    id: "2",
    number: "INV-2024-002",
    date: new Date("2024-02-15"),
    dueDate: new Date("2024-02-15"),
    amount: 12.0,
    status: "paid",
    plan: "Pro",
    paymentMethod: "Visa •••• 4242",
    items: [{ description: "Pro Monthly Subscription", quantity: 1, unitPrice: 12.0, total: 12.0 }],
  },
  {
    id: "3",
    number: "INV-2024-003",
    date: new Date("2024-03-15"),
    dueDate: new Date("2024-03-15"),
    amount: 12.0,
    status: "paid",
    plan: "Pro",
    paymentMethod: "Visa •••• 4242",
    items: [{ description: "Pro Monthly Subscription", quantity: 1, unitPrice: 12.0, total: 12.0 }],
  },
  {
    id: "4",
    number: "INV-2024-004",
    date: new Date("2024-04-15"),
    dueDate: new Date("2024-04-30"),
    amount: 29.0,
    status: "pending",
    plan: "Premium",
    paymentMethod: "Visa •••• 4242",
    items: [
      { description: "Premium Monthly Subscription", quantity: 1, unitPrice: 29.0, total: 29.0 },
    ],
  },
  {
    id: "5",
    number: "INV-2024-005",
    date: new Date("2024-05-01"),
    dueDate: new Date("2024-05-15"),
    amount: 29.0,
    status: "overdue",
    plan: "Premium",
    paymentMethod: "Visa •••• 4242",
    items: [
      { description: "Premium Monthly Subscription", quantity: 1, unitPrice: 29.0, total: 29.0 },
    ],
  },
];

const statusVariants: Record<Invoice["status"], "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
  cancelled: "outline",
};

const statusColors: Record<Invoice["status"], string> = {
  paid: "bg-green-500/10 text-green-600 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  overdue: "bg-red-500/10 text-red-600 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.plan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = mockInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalPending = mockInvoices
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  const handleDownload = (invoice: Invoice) => {
    // Simulate PDF download
    const content = `
Invoice: ${invoice.number}
Date: ${format(invoice.date, "MMMM dd, yyyy")}
Amount: $${invoice.amount.toFixed(2)}
Status: ${invoice.status.toUpperCase()}
Plan: ${invoice.plan}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            View and download your billing history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{mockInvoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">${totalPending.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="text-sm font-medium">Visa •••• 4242</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>All your billing records in one place</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-muted-foreground">No invoices found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.number}</TableCell>
                        <TableCell>{format(invoice.date, "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{invoice.plan}</Badge>
                        </TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[invoice.status]} variant="outline">
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(invoice)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Detail Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice {selectedInvoice?.number}</DialogTitle>
            <DialogDescription>
              {selectedInvoice && format(selectedInvoice.date, "MMMM dd, yyyy")}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedInvoice.status]} variant="outline">
                    {selectedInvoice.status.charAt(0).toUpperCase() +
                      selectedInvoice.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{selectedInvoice.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {format(selectedInvoice.dueDate, "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium">{selectedInvoice.plan}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Items</h4>
                {selectedInvoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">${item.total.toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t mt-3 pt-3 flex justify-between">
                  <p className="font-semibold">Total</p>
                  <p className="font-semibold">${selectedInvoice.amount.toFixed(2)}</p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => handleDownload(selectedInvoice)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
