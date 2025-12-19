<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Borrowing>
 */
class BorrowingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'asset_id' => $this->faker->numberBetween(1, 100),
            'borrower_id' => $this->faker->numberBetween(1, 100),
            'borrow_date' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'return_date' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'status' => $this->faker->randomElement(['borrowed', 'returned']),
        ];
    }
}
