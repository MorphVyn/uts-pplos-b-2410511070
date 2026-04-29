<?php

namespace App\Models;

use CodeIgniter\Model;

class EventModel extends Model
{
    protected $table         = 'events';
    protected $primaryKey    = 'id';
    protected $allowedFields = ['name', 'description', 'event_date', 'location', 'poster_url'];
    protected $useTimestamps = true;
}
