<?php

namespace App\Http\Controllers;

use App\Enums\Department;
use App\Exports\UsersExport;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->with('roles')
            ->when($request->search, fn($q) =>
                $q->where(function ($qq) use ($request) {
                    $qq->where('name', 'like', "%{$request->search}%")
                       ->orWhere('email', 'like', "%{$request->search}%");
                })
            )
            ->when($request->role, fn($q) =>
                $q->whereHas('roles', fn($r) => $r->where('name', $request->role))
            )
            ->when($request->status, fn($q) => $request->status === 'Active' 
                ? $q->whereNotNull('email_verified_at') 
                : $q->whereNull('email_verified_at')
            )
            ->paginate(10)
            ->through(fn($user) => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->roles->first()?->name ?? '-',
                'status'     => $user->email_verified_at ? 'Active' : 'Inactive',
                'department' => $user->department,
            ]);

        return Inertia::render('users/index', [
            'users'   => $users,
            'filters' => $request->only('search', 'role', 'status'),
            'departments'  => Department::options(), 
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'unique:users,email'],
            'password'   => ['required', 'min:8'],
            'role'       => ['required', 'in:admin,manager,staff'],
            'status'     => ['required', 'in:Active,Inactive'],
            'department' => ['required', new Enum(Department::class)],
        ]);

        $user = User::create([
            'name'              => $data['name'],
            'email'             => $data['email'],
            'password'          => bcrypt($data['password']),
            'department'        => $data['department'],
            'email_verified_at' => $data['status'] === 'Active' ? now() : null,
        ]);

        $user->assignRole($data['role']);

        return redirect()
            ->back()
            ->with('success', 'User berhasil ditambahkan');
    }


    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'       => 'required',
            'email'      => 'required|email|unique:users,email,' . $user->id, 
            'role'       => 'required|in:admin,manager,staff',
            'department' => 'required',
            'status'     => 'nullable|in:Active,Inactive', 
        ]);

        $user->update([
            'name'             => $data['name'],
            'email'            => $data['email'],
            'department'       => $data['department'],
            'email_verified_at' => $data['status'] === 'Active' ? now() : null,    
        ]);

        $user->syncRoles([$data['role']]);

        return back()->with('success', 'User berhasil diperbarui');
    }

    public function scopeStatus($query, $status)
    {
        if ($status === 'Active') return $query->whereNotNull('email_verified_at');
        if ($status === 'Inactive') return $query->whereNull('email_verified_at');
        return $query;
    }

    public function exportExcel()
    {
        return Excel::download(
            new UsersExport,
            'users.xlsx'
        );
    }


    public function exportPdf()
    {
        $users = User::with('roles')->get();

        return Pdf::loadView('pdf.users', compact('users'))
            ->download('users.pdf');
    }


    public function destroy(User $user)
    {
        $user->delete();
        return back()->with('success', 'User berhasil dihapus');
    }
}
