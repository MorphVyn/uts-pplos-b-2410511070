<?php

namespace App\Controllers;

use App\Models\EventModel;
use App\Models\TicketCategoryModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class TicketCategoryController extends ResourceController
{
    protected $format = 'json';
    private EventModel $events;
    private TicketCategoryModel $categories;

    public function __construct()
    {
        $this->events     = new EventModel();
        $this->categories = new TicketCategoryModel();
    }

    public function index($eventId): ResponseInterface
    {
        if (!$this->events->find($eventId)) return $this->failNotFound('Event tidak ditemukan.');
        $data = $this->categories->where('event_id', $eventId)->findAll();
        return $this->respond(['data' => $data]);
    }

    public function show($eventId, $id): ResponseInterface
    {
        $cat = $this->categories->where('event_id', $eventId)->where('id', $id)->first();
        if (!$cat) return $this->failNotFound('Kategori tidak ditemukan.');
        return $this->respond(['data' => $cat]);
    }

    public function create($eventId): ResponseInterface
    {
        if (!$this->events->find($eventId)) return $this->failNotFound('Event tidak ditemukan.');
        $json = $this->request->getJSON(true);

        if (empty($json['name']) || !isset($json['price']) || empty($json['quota'])) {
            return $this->failValidationError('name, price, dan quota wajib diisi.');
        }

        $id = $this->categories->insert([
            'event_id'    => (int) $eventId,
            'name'        => $json['name'],
            'price'       => $json['price'],
            'quota'       => (int) $json['quota'],
            'sold'        => 0,
            'description' => $json['description'] ?? '',
        ]);

        return $this->respondCreated([
            'message' => 'Kategori tiket berhasil dibuat.',
            'data'    => $this->categories->find($id),
        ]);
    }

    public function update($eventId, $id): ResponseInterface
    {
        $cat = $this->categories->where('event_id', $eventId)->where('id', $id)->first();
        if (!$cat) return $this->failNotFound('Kategori tidak ditemukan.');

        $json = $this->request->getJSON(true);
        unset($json['event_id'], $json['sold']);
        $this->categories->update($id, $json);

        return $this->respond([
            'message' => 'Kategori berhasil diperbarui.',
            'data'    => $this->categories->find($id),
        ]);
    }

    public function delete($eventId, $id): ResponseInterface
    {
        $cat = $this->categories->where('event_id', $eventId)->where('id', $id)->first();
        if (!$cat) return $this->failNotFound('Kategori tidak ditemukan.');
        $this->categories->delete($id);
        return $this->respondDeleted(['message' => 'Kategori berhasil dihapus.']);
    }
}
