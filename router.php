<?php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

if (is_file($file)) {
    return false;
}

$indexFile = __DIR__ . '/index.html';
if (is_file($indexFile)) {
    include $indexFile;
}