<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view dashboard',
            'manage users',
            'manage categories',
            'manage assets',
            'borrow asset',
            'approve borrowing',
            'return asset',
            'view reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin   = Role::firstOrCreate(['name' => 'Admin']);
        $manager = Role::firstOrCreate(['name' => 'Manager']);
        $staff   = Role::firstOrCreate(['name' => 'Staff']);

        $admin->givePermissionTo(Permission::all());

        $manager->givePermissionTo([
            'view dashboard',
            'approve borrowing',
            'view reports',
        ]);

        $staff->givePermissionTo([
            'view dashboard',
            'borrow asset',
            'return asset',
        ]);
    }
}
