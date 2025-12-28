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
        $filters = [
            'search' => $request->search ? strtolower($request->search) : null,
            'role'   => $request->role ? strtolower($request->role) : null,
        ];


        $users = User::query()
            ->with('roles')
            ->when($filters['search'], fn($q) =>
                $q->where(function ($qq) use ($filters) {
                    $qq->whereRaw('LOWER(name) like ?', ["%{$filters['search']}%"])
                    ->orWhereRaw('LOWER(email) like ?', ["%{$filters['search']}%"]);
                })
            )
            ->when($filters['role'], fn($q) =>
                $q->whereHas('roles', fn($r) =>
                    $r->whereRaw('LOWER(name) = ?', [$filters['role']])
                )
            )
            ->paginate(10)
            ->through(fn($user) => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->roles->first()?->name ?? '-',
                'status'     => $user->email_verified_at ? 'Aktif' : 'Tidak Aktif',
                'department' => $user->department,
            ]);


        $roles = Role::all();

        return Inertia::render('users/index', [
            'users'   => $users,
            'roles' => $roles,
            'filters' => $filters,
            'departments'  => Department::options(), 
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:8'],
            'role'       => ['required', 'in:Admin,Manager,Staff'],
            'department' => ['required', new Enum(Department::class)],
        ], [
            'name.required'       => 'Nama wajib diisi.',
            'name.string'         => 'Nama harus berupa teks.',
            'name.max'            => 'Nama maksimal 255 karakter.',
            'email.required'      => 'Email wajib diisi.',
            'email.email'         => 'Email tidak valid.',
            'email.unique'        => 'Email sudah digunakan.',
            'password.required'   => 'Password wajib diisi.',
            'password.min'        => 'Password minimal 8 karakter.',
            'role.required'       => 'Role wajib dipilih.',
            'role.in'             => 'Role yang dipilih tidak valid.',
            'department.required' => 'Departemen wajib dipilih.',
            'department.enum'     => 'Departemen tidak valid.',
        ]);

        $user = User::create([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'password'   => bcrypt($data['password']),
            'department' => $data['department'],
        ]);

        $user->email_verified_at = now();
        $user->save();

        $user->assignRole($data['role']);

        return redirect()->back()->with('success', 'User berhasil ditambahkan');
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'unique:users,email,' . $user->id],
            'role'       => ['required', 'in:Admin,Manager,Staff'],
            'department' => ['required', new Enum(Department::class)],
        ], [
            'name.required'       => 'Nama wajib diisi.',
            'name.string'         => 'Nama harus berupa teks.',
            'name.max'            => 'Nama maksimal 255 karakter.',
            'email.required'      => 'Email wajib diisi.',
            'email.email'         => 'Email tidak valid.',
            'email.unique'        => 'Email sudah digunakan.',
            'role.required'       => 'Role wajib dipilih.',
            'role.in'             => 'Role yang dipilih tidak valid.',
            'department.required' => 'Departemen wajib dipilih.',
            'department.enum'     => 'Departemen tidak valid.',
        ]);

        $user->update([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'department' => $data['department'],
        ]);

        $user->syncRoles([$data['role']]);

        return back()->with('success', 'User berhasil diperbarui');
    }

    public function scopeStatus($query, $status)
    {
        if ($status === 'Aktif') return $query->whereNotNull('email_verified_at');
        if ($status === 'Tidak Aktif') return $query->whereNull('email_verified_at');
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
