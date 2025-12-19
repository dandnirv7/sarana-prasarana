<?php

namespace App\Enums;

enum Department: string
{
    case IT = 'IT';
    case GA = 'GA';
    case O = 'O';

    public static function options(): array
    {
        return array_map(
            fn ($case) => [
                'label' => $case->value,
                'value' => $case->value,
            ],
            self::cases()
        );
    }
}
