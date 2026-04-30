<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run()
    {
        // ── Events ─────────────────────────────────────────────────────────
        $events = [
            [
                'name'        => 'Java Jazz Festival 2025',
                'description' => 'Festival musik jazz terbesar di Asia Tenggara. Menampilkan ratusan musisi lokal dan internasional selama 3 hari penuh.',
                'event_date'  => '2025-08-15',
                'location'    => 'Jakarta Convention Center, Jakarta',
                'poster_url'  => null,
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ],
            [
                'name'        => 'Soundrenaline 2025',
                'description' => 'Festival musik rock dan metal terbesar Indonesia dengan lineup artis dalam dan luar negeri.',
                'event_date'  => '2025-09-06',
                'location'    => 'Gelora Bung Karno, Jakarta',
                'poster_url'  => null,
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ],
            [
                'name'        => 'Djakarta Warehouse Project 2025',
                'description' => 'Festival musik elektronik terbesar di Asia, menghadirkan DJ dan producer kelas dunia.',
                'event_date'  => '2025-12-05',
                'location'    => 'Beach City International Stadium, Jakarta',
                'poster_url'  => null,
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ],
        ];

        $this->db->table('events')->insertBatch($events);

        // ── Ticket Categories ───────────────────────────────────────────────
        $categories = [
            // Java Jazz Festival (event_id: 1)
            [
                'event_id'    => 1,
                'name'        => 'Festival Pass (3 Hari)',
                'price'       => 1500000,
                'quota'       => 500,
                'sold'        => 0,
                'description' => 'Akses penuh selama 3 hari festival.',
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ],
            [
                'event_id'    => 1,
                'name'        => 'VIP',
                'price'       => 3500000,
                'quota'       => 100,
                'sold'        => 0,
                'description' => 'Akses VIP area, lounge eksklusif, dan meet & greet.',
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ],
            // Soundrenaline (event_id: 2)
            [
                'event_id'    => 2,
                'name'        => 'Regular',
                'price'       => 450000,
                'quota'       => 1000,
                'sold'        => 0,
                'description' => 'Tiket reguler festival area.',
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ],
            [
                'event_id'    => 2,
                'name'        => 'VIP',
                'price'       => 950000,
                'quota'       => 200,
                'sold'        => 0,
                'description' => 'Akses VIP pit area dekat panggung.',
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ],
            // DWP (event_id: 3)
            [
                'event_id'    => 3,
                'name'        => '1 Day Pass',
                'price'       => 750000,
                'quota'       => 2000,
                'sold'        => 0,
                'description' => 'Akses 1 hari pilihan.',
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ],
            [
                'event_id'    => 3,
                'name'        => '2 Day Pass',
                'price'       => 1300000,
                'quota'       => 1000,
                'sold'        => 0,
                'description' => 'Akses 2 hari festival.',
                'created_at'  => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ],
        ];

        $this->db->table('ticket_categories')->insertBatch($categories);

        echo "EventSeeder selesai: 3 event, 6 kategori tiket.\n";
    }
}
