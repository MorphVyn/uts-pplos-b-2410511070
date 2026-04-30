<?php

namespace App\Controllers;

use App\Models\EventModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class EventController extends ResourceController
{
    protected $modelName = EventModel::class;
    protected $format    = 'json';

    public function index(): ResponseInterface
    {
        $page    = (int) ($this->request->getGet('page')     ?? 1);
        $perPage = (int) ($this->request->getGet('page_per') ?? 10);
        $search  = $this->request->getGet('search');
        $date    = $this->request->getGet('date');

        $builder = $this->model->builder();

        if ($search) {
            $builder->groupStart()
                ->like('name', $search)
                ->orLike('description', $search)
                ->groupEnd();
        }
        if ($date) {
            $builder->where('event_date', $date);
        }

        $total  = $builder->countAllResults(false);
        $data   = $builder
            ->orderBy('event_date', 'ASC')
            ->limit($perPage, ($page - 1) * $perPage)
            ->get()->getResultArray();

        return $this->respond([
            'data'       => $data,
            'pagination' => [
                'total'    => $total,
                'page'     => $page,
                'per_page' => $perPage,
                'pages'    => (int) ceil($total / max($perPage, 1)),
            ],
        ]);
    }

    public function show($id = null): ResponseInterface
    {
        $event = $this->model->find($id);
        if (!$event) return $this->failNotFound('Event tidak ditemukan.');
        return $this->respond(['data' => $event]);
    }

    public function create(): ResponseInterface
    {
        $json = $this->request->getJSON(true);

        if (empty($json['name']) || empty($json['event_date']) || empty($json['location'])) {
            return $this->failValidationError('name, event_date, dan location wajib diisi.');
        }

        $id = $this->model->insert([
            'name'        => $json['name'],
            'description' => $json['description'] ?? '',
            'event_date'  => $json['event_date'],
            'location'    => $json['location'],
            'poster_url'  => $json['poster_url'] ?? null,
        ]);

        return $this->respondCreated(['message' => 'Event berhasil dibuat.', 'data' => $this->model->find($id)]);
    }

    public function update($id = null): ResponseInterface
    {
        if (!$this->model->find($id)) return $this->failNotFound('Event tidak ditemukan.');
        $json = $this->request->getJSON(true);
        $this->model->update($id, $json);
        return $this->respond(['message' => 'Event berhasil diperbarui.', 'data' => $this->model->find($id)]);
    }

    public function delete($id = null): ResponseInterface
    {
        if (!$this->model->find($id)) return $this->failNotFound('Event tidak ditemukan.');
        $this->model->delete($id);
        return $this->respondDeleted(['message' => 'Event berhasil dihapus.']);
    }
}
