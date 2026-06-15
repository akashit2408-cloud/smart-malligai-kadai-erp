'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, UserCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { Employee } from '@/types';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { EmployeeInput } from '@/lib/validations/employee';

type NewEmployeePayload = EmployeeInput & { store_id: string };

export default function EmployeesPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const storeId = profile?.store_id;
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', storeId, search],
    queryFn: async () => {
      if (!storeId) return [];
      let query = supabase.from('employees').select('*').eq('store_id', storeId);
      if (search) query = query.ilike('full_name', `%${search}%`);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!storeId,
  });

  const addEmployee = useMutation({
    mutationFn: async (employee: NewEmployeePayload) => {
      const { data, error } = await supabase.from('employees').insert(employee).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowForm(false);
    },
  });

  const checkIn = useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await supabase.from('attendance').insert({
        employee_id: employeeId,
        store_id: storeId,
        check_in: new Date().toISOString(),
        status: 'present',
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Staff, attendance, and salary</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {showForm && (
        <EmployeeForm
          storeId={storeId!}
          onSubmit={(data) => addEmployee.mutate(data)}
          onCancel={() => setShowForm(false)}
          isSubmitting={addEmployee.isPending}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Staff List</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search employees..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : employees?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCircle className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No employees yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {employees?.map((e) => (
                <div key={e.id} className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{e.full_name}</p>
                    <p className="text-sm text-muted-foreground">{e.role} • {e.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(e.salary)}</p>
                      <p className="text-xs text-muted-foreground">Salary</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => checkIn.mutate(e.id)}>
                      <Clock className="mr-1 h-4 w-4" />
                      Check In
                    </Button>
                    <Badge variant={e.is_active ? 'default' : 'secondary'}>{e.is_active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
