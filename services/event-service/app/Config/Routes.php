<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Event Service Routes — semua dilindungi JWT filter
$routes->group('api', ['filter' => 'jwt'], function ($routes) {

    // Events CRUD
    $routes->get('events',            'EventController::index');
    $routes->post('events',           'EventController::create');
    $routes->get('events/(:num)',     'EventController::show/$1');
    $routes->put('events/(:num)',     'EventController::update/$1');
    $routes->delete('events/(:num)', 'EventController::delete/$1');

    // Ticket Categories (nested di bawah event)
    $routes->get('events/(:num)/categories',              'TicketCategoryController::index/$1');
    $routes->post('events/(:num)/categories',             'TicketCategoryController::create/$1');
    $routes->get('events/(:num)/categories/(:num)',       'TicketCategoryController::show/$1/$2');
    $routes->put('events/(:num)/categories/(:num)',       'TicketCategoryController::update/$1/$2');
    $routes->delete('events/(:num)/categories/(:num)',    'TicketCategoryController::delete/$1/$2');
});
