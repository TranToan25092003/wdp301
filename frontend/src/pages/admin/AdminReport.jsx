import React, { useState } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { customFetch } from "@/utils/customAxios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaginationDemo } from "@/components/global/PaginationComp";
import { Search, Calendar, User, Package, TrendingUp, AlertTriangle, DollarSign, Users, Crown, Clock } from "lucide-react";

export const adminReportLoader = async ({ request }) => {
  const params = Object.fromEntries([
    ...new URL(request.url).searchParams.entries(),
  ]);

  try {
    const response = await customFetch.get("/admin/reports", { params });
    return {
      transactions: response.data.transactions,
      statistics: response.data.statistics,
      searchParams: params,
    };
  } catch (error) {
    toast.error("Error fetching admin report");
    console.error("Loader Error:", error);
    return {
      transactions: { data: [], totalItems: 0, totalPages: 0, currentPage: 1 },
      statistics: {
        topTransactingUsers: [],
        reputableSellers: [],
        mostReportedUsers: [],
        mostProblematicBorrowers: [],
      },
      searchParams: params,
      error: "Failed to load report data.",
    };
  }
};

const AdminReport = () => {
  const { transactions, statistics, searchParams, error } = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();

  const [localStartDate, setLocalStartDate] = useState(searchParams.startDate || "");
  const [localEndDate, setLocalEndDate] = useState(searchParams.endDate || "");
  const [localSearchUser, setLocalSearchUser] = useState(searchParams.searchUser || "");
  const [localSearchItem, setLocalSearchItem] = useState(searchParams.searchItem || "");

  const handleSearch = (e) => {
    e.preventDefault();
    const currentParams = new URLSearchParams(location.search);

    if (localStartDate) currentParams.set("startDate", localStartDate); else currentParams.delete("startDate");
    if (localEndDate) currentParams.set("endDate", localEndDate); else currentParams.delete("endDate");
    if (localSearchUser) currentParams.set("searchUser", localSearchUser); else currentParams.delete("searchUser");
    if (localSearchItem) currentParams.set("searchItem", localSearchItem); else currentParams.delete("searchItem");

    currentParams.set("page", 1);
    navigate(`${location.pathname}?${currentParams.toString()}`);
  };

  const handlePageChange = (page) => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.set("page", page);
    navigate(`${location.pathname}?${currentParams.toString()}`);
  };

  const clearFilters = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    setLocalSearchUser("");
    setLocalSearchItem("");
    navigate(location.pathname);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive reporting and analytics</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <Search className="w-5 h-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>Filter transactions by date range, user, or item</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchUser" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4" />
                    Search User
                  </Label>
                  <Input
                    id="searchUser"
                    type="text"
                    placeholder="User name or email"
                    value={localSearchUser}
                    onChange={(e) => setLocalSearchUser(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchItem" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Package className="w-4 h-4" />
                    Search Item
                  </Label>
                  <Input
                    id="searchItem"
                    type="text"
                    placeholder="Item name"
                    value={localSearchItem}
                    onChange={(e) => setLocalSearchItem(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Clear Filters
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Apply Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                Top Transacting Users
              </CardTitle>
              <CardDescription>Users with the highest transaction volumes</CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.topTransactingUsers.length > 0 ? (
                <div className="space-y-3">
                  {statistics.topTransactingUsers.map((userStat, index) => (
                    <div key={userStat.user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{userStat.user.name}</p>
                          <p className="text-sm text-gray-500">{userStat.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {userStat.transactionCount}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No transaction data available</p>
                  <p className="text-sm">Transaction data will appear here once available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Crown className="w-5 h-5" />
                Reputable Sellers
              </CardTitle>
              <CardDescription>Sellers with high success rates and positive standing</CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.reputableSellers && statistics.reputableSellers.length > 0 ? (
                <div className="space-y-3">
                  {statistics.reputableSellers.map((sellerStat, index) => (
                    <div key={sellerStat.user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{sellerStat.user.name}</p>
                          <p className="text-sm text-gray-500">{sellerStat.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        {sellerStat.averageRating ? sellerStat.averageRating.toFixed(1) : 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Crown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No reputable sellers data available</p>
                  <p className="text-sm">Seller reputation data will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" />
                Most Reported Users
              </CardTitle>
              <CardDescription>Users who have been reported multiple times</CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.mostReportedUsers && statistics.mostReportedUsers.length > 0 ? (
                <div className="space-y-3">
                  {statistics.mostReportedUsers.map((reportedUserStat, index) => (
                    <div key={reportedUserStat.user.id} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{reportedUserStat.user.name}</p>
                            <p className="text-sm text-gray-500">{reportedUserStat.user.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {reportedUserStat.reportCount} Reports
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Reports:</p>
                        {reportedUserStat.reports.map(report => (
                          <div key={report._id} className="flex items-center justify-between mt-1 pl-4 border-l-2 border-orange-200">
                            <p className="text-sm text-gray-600 truncate">
                              {report.title} ({new Date(report.createdAt).toLocaleDateString()})
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/reports/${report._id}`)}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              View Details
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No reported users data available</p>
                  <p className="text-sm">Users with multiple reports will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Clock className="w-5 h-5" />
                Most Problematic Borrowers
              </CardTitle>
              <CardDescription>Borrowers with late or unreturned items</CardDescription>
            </CardHeader>
            <CardContent>
              {statistics.mostProblematicBorrowers && statistics.mostProblematicBorrowers.length > 0 ? (
                <div className="space-y-3">
                  {statistics.mostProblematicBorrowers.map((borrowerStat, index) => (
                    <div key={borrowerStat.user.id} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{borrowerStat.user.name}</p>
                            <p className="text-sm text-gray-500">{borrowerStat.user.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {borrowerStat.totalViolations} Violations
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Late Returns: {borrowerStat.lateCount}</p>
                        <p>Unreturned Items: {borrowerStat.unreturnedCount}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/reports/user/${borrowerStat.user.id}`)}
                        className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        View User Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No problematic borrowers data available</p>
                  <p className="text-sm">Borrowers with late or unreturned items will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <DollarSign className="w-5 h-5" />
              Transaction History
              <Badge variant="outline" className="ml-2">
                {transactions.totalItems} total
              </Badge>
            </CardTitle>
            <CardDescription>Complete transaction records with user and item details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Item</TableHead>
                    <TableHead className="font-semibold text-gray-700">User</TableHead>
                    <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.data.length > 0 ? (
                    transactions.data.map((txn, index) => (
                      <TableRow key={txn.transactionId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                        <TableCell>
                          <Badge
                            variant={txn.type === 'Buy' ? 'default' : 'secondary'}
                            className={txn.type === 'Buy' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {txn.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {txn.item ? (
                            <div className="flex items-center gap-3">
                              {txn.item.images && txn.item.images.length > 0 && (
                                <img
                                  src={txn.item.images[0]}
                                  alt={txn.item.name}
                                  className="w-10 h-10 object-cover rounded-md border border-gray-200"
                                />
                              )}
                              <span className="font-medium text-gray-800">{txn.item.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-800">{txn.user.name}</p>
                            <p className="text-sm text-gray-500">{txn.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-600">${txn.totalAmount.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{new Date(txn.date).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              txn.status === 'completed' ? 'default' :
                              txn.status === 'late' ? 'destructive' :
                              txn.status === 'unreturned' ? 'destructive' :
                              'secondary'
                            }
                            className={
                              txn.status === 'late' ? 'bg-red-100 text-red-800' :
                              txn.status === 'unreturned' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {txn.status || 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="space-y-2">
                          <Package className="w-10 h-10 mx-auto text-gray-300" />
                          <p className="text-gray-500 font-medium">No transactions found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {transactions.totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <PaginationDemo
                  currentPage={transactions.currentPage}
                  totalPages={transactions.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReport;