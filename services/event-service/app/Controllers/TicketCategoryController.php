<?php

namespace App\Controllers;

use App\Models\EventModel;
use App\Models\TicketCategoryModel;
use CodeIgniter\Controller;

class TicketCategoryController extends Controller
{
    private EventModel $events;
    private TicketCategoryModel $categories;

    public function __construct()
    {
        $this->events     = new EventModel();
        $this->categories = new TicketCategoryModel();
    }

    public function index($eventId)
    {
        if (!$this->events->find($eventId)) {
            return $this->response->setStatusCode(404)
                ->setJSON(['message' => 'Event tidak ditemukan.']);
        }
        $data = $this->categories->where('event_id', $eventId)->findAll();
        return $this->response->setStatusCode(200)->setJSON(['data' => $data]);
    }

    public function show($eventId, $id)
    {
        $cat = $this->categories->where('event_id', $eventId)->where('id', $id)->first();
        if (!$cat) {
            return $this->response->setStatusCode(404)
                ->setJSON(['message' => 'Kategori tidak ditemukan.']);
        }
        return $this->response->setStatusCode(200)->setJSON(['data' => $cat]);
    }

    public function create($eventId)
    {
        if (!$this->events->find($eventId)) {
            return $this->response->setStatusCode(404)
                ->setJSON(['message' => 'Event tidak ditemukan.']);
        }

        $json = $this->request->getJSON(true);

        if (empty($json['name']) || !isset($json['price']) || empty($json['quota'])) {
            return $this->response->setStatusCode(422)
                ->setJSON(['message' => 'name, price, dan quota wajib diisi.']);
        }

        $id = $this->categories->insert([
            'event_id'    => (int) $eventId,
            'name'        => $json['name'],
            'price'       => $json['price'],
            'quota'       => (int) $json['quota'],
            'sold'        => 0,
            'description' => $json['description'] ?? '',
        ]);

        return $this->response->setStatusCode(201)->setJSON([
            'message' => 'Kategori tiket berhasil dibuat.',
            'data'    => $this->categories->find($id),
        ]);
    }

    public function update($eventId, $id)
    {
        $cat = $this->categories->where('event_id', $eventId)->where('id', $id)->first();
        if (!$cat) {
            return $this->response->setStatusCode(404)
                ->setJSON(['message' => 'Kategori tidak ditemukan.']);
        }

        $json = $this->request->getJSON(true);
        unset($json['event_id'], $json['sold']);
        $this->categories->update($id, $json);

        return $this->response->setStatusCode(200)->setJSON([
            'message' => 'Kategori berhasil diperbarui.',
            'data'    => $this->categories->find($id),
        ]);
    }

    public function delete($eventId, $id)
    {
        $cat = $this->categories->where('event_id', $eventId)->where('id', $id)->first();
        if (!$cat) {
            return $this->response->setStatusCode(404)
                ->setJSON(['message' => 'Kategori tidak ditemukan.']);
        }
        $this->categories->delete($id);
        return $this->response->setStatusCode(200)
            ->setJSON(['message' => 'Kategori berhasil dihapus.']);
    }
}