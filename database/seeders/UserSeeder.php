<?php

namespace Database\Seeders;

use App\Enums\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin Sarpras',
            'email' => 'admin@sarpras.test',
            'department' => Department::IT,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('Admin');

        $manager = User::create([
            'name' => 'Manager Sarpras',
            'email' => 'manager@sarpras.test',
            'department' => Department::O,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $manager->assignRole('Manager');

        $staff = User::create([
            'name' => 'Staff Sarpras',
            'email' => 'staff@sarpras.test',
            'department' => Department::GA,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $staff->assignRole('Staff');
    }
}
