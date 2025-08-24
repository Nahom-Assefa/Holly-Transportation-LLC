import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { ArrowLeft, Activity, User, MapPin, Trash2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { formatTime } from "@/utils/timeUtils";
import { formatServiceType, formatStatus } from "@/utils/formatUtils";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminAuditLogs() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const pageSize = 25;
  const queryClient = useQueryClient();

  // Fetch audit logs
  const { data: auditData, isLoading: logsLoading } = useQuery<AuditLogsResponse>({
    queryKey: ['/api/admin/audit-logs', currentPage],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/audit-logs?page=${currentPage}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      return response.json();
    },
    enabled: !!user?.isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const auditLogs = auditData?.logs || [];
  const pagination = auditData?.pagination;

  // Bulk delete mutation
  const deleteLogsMutation = useMutation({
    mutationFn: async (logIds: string[]) => {
      const response = await apiRequest("DELETE", `/api/admin/audit-logs/bulk`, { logIds });
      if (!response.ok) {
        throw new Error('Failed to delete audit logs');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/audit-logs'] });
      setSelectedLogs(new Set());
      setSelectAll(false);
    },
    onError: (error) => {
      console.error('Error deleting audit logs:', error);
      alert('Failed to delete selected audit logs. Please try again.');
    }
  });

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedLogs(new Set(auditLogs.map(log => log.id)));
    } else {
      setSelectedLogs(new Set());
    }
  };

  // Handle individual log selection
  const handleLogSelection = (logId: string, checked: boolean) => {
    const newSelected = new Set(selectedLogs);
    if (checked) {
      newSelected.add(logId);
    } else {
      newSelected.delete(logId);
    }
    setSelectedLogs(newSelected);
    setSelectAll(newSelected.size === auditLogs.length);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedLogs.size === 0) return;
    
    const count = selectedLogs.size;
    const confirmMessage = `Are you sure you want to delete ${count} audit log${count > 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      deleteLogsMutation.mutate(Array.from(selectedLogs));
    }
  };

  // Reset selection when page changes
  useEffect(() => {
    setSelectedLogs(new Set());
    setSelectAll(false);
  }, [currentPage]);

  // Format action for display
  const formatAction = (action: string) => {
    switch (action) {
      case 'booking_deleted':
        return 'Booking Deleted';
      case 'profile_updated':
        return 'Profile Updated';
      case 'booking_created':
        return 'Booking Created';

      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'booking_deleted':
        return 'bg-red-100 text-red-700';
      case 'profile_updated':
        return 'bg-blue-100 text-blue-700';
      case 'booking_created':
        return 'bg-green-100 text-green-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format entity type
  const formatEntityType = (entityType: string) => {
    return entityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
                                  <Button variant="ghost" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          <h1 className="text-3xl font-bold text-gray-900">User Change Log</h1>
          <p className="text-gray-600 mt-2">
            Track all user actions and system changes
          </p>
        </div>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Activity Log</span>
            </CardTitle>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({selectedLogs.size} selected)
                </label>
              </div>
              {selectedLogs.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleteLogsMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected ({selectedLogs.size})</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading audit logs...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No audit logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Left Column: Activity and User Information */}
                      <div className="space-y-3">
                        {/* Checkbox and Action Badges */}
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`log-${log.id}`}
                            checked={selectedLogs.has(log.id)}
                            onCheckedChange={(checked) => handleLogSelection(log.id, checked as boolean)}
                          />
                          <Badge className={getActionColor(log.action)}>
                            {formatAction(log.action)}
                          </Badge>
                          <Badge variant="outline">
                            {formatEntityType(log.entityType)}
                          </Badge>
                        </div>

                        {/* User Information */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>
                              {log.user.firstName && log.user.lastName 
                                ? `${log.user.firstName} ${log.user.lastName}`
                                : log.user.email
                              }
                            </span>
                          </div>
                          {log.ipAddress && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{log.ipAddress}</span>
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Right Column: Patient/Entity Information */}
                      <div className="lg:col-span-2">
                        {/* Action-specific details */}
                        {log.action === 'booking_deleted' && log.details && (
                          <div className="bg-gray-50 rounded p-3 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <strong>Patient:</strong> {log.details.patientName}
                              </div>
                              <div>
                                <strong>Route:</strong> {log.details.pickupAddress} → {log.details.destination}
                              </div>
                              <div>
                                <strong>Date:</strong> {log.details.pickupDate}
                              </div>
                              <div>
                                <strong>Time:</strong> {formatTime(log.details.pickupTime)}
                              </div>
                              <div>
                                <strong>Service:</strong> {formatServiceType(log.details.serviceType)}
                              </div>
                              <div>
                                <strong>Status:</strong> {formatStatus(log.details.status)}
                              </div>
                            </div>
                            <div className="mt-2 text-gray-600">
                              <strong>Reason:</strong> {log.details.reason}
                            </div>
                          </div>
                        )}

                        {log.action === 'profile_updated' && log.details && (
                          <div className="bg-gray-50 rounded p-3 text-sm">
                            <div className="text-gray-600">
                              <strong>Changes:</strong> {log.details.changes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pageSize) + 1} to {Math.min(pagination.page * pageSize, pagination.total)} of {pagination.total} logs
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
