<?php

namespace App\Models;

use CodeIgniter\Model;

class TicketCategoryModel extends Model
{
    protected $table         = 'ticket_categories';
    protected $primaryKey    = 'id';
    protected $allowedFields = ['event_id', 'name', 'price', 'quota', 'sold', 'description'];
    protected $useTimestamps = true;
}
