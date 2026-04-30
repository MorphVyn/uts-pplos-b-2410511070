<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return \Config\Services::response()
                ->setStatusCode(401)
                ->setJSON(['message' => 'Token tidak ditemukan.']);
        }

<<<<<<< HEAD
        $token  = substr($header, 7);
        $secret = env('JWT_SECRET') ?: getenv('JWT_SECRET') ?: ($_ENV['JWT_SECRET'] ?? null);

        try {
            $decoded       = JWT::decode($token, new Key($secret, 'HS256'));
            $request->user = $decoded;
=======
        $token = substr($header, 7);

        log_message('error', 'TOKEN: ' . $token);
        log_message('error', 'SECRET: ' . env('JWT_SECRET'));

        try {
            $decoded        = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            $request->user  = $decoded;
>>>>>>> origin/feature/event-ticket
        } catch (ExpiredException) {
            return \Config\Services::response()
                ->setStatusCode(401)
                ->setJSON(['message' => 'Token sudah kadaluarsa.']);
        } catch (\Throwable) {
            return \Config\Services::response()
                ->setStatusCode(401)
                ->setJSON(['message' => 'Token tidak valid.']);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/feature/event-ticket
