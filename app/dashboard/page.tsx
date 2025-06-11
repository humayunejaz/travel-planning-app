import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { trips } from "@/data/trips"
import Link from "next/link"
import { SupabaseTestPanel } from "@/components/supabase-test-panel"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Your Trips</h1>
        <Link href="/trip/new">
          <Button>Create New Trip</Button>
        </Link>
      </div>

      {/* Debug Panel - Remove this after fixing the issue */}
      <div className="mb-8">
        <SupabaseTestPanel />
      </div>

      <Table>
        <TableCaption>A list of your recent trips.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map((trip) => (
            <TableRow key={trip.invoice}>
              <TableCell className="font-medium">{trip.invoice}</TableCell>
              <TableCell>{trip.status}</TableCell>
              <TableCell>{trip.method}</TableCell>
              <TableCell className="text-right">{trip.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
