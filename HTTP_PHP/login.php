<?php

/********************************************************************
 Inicializar cabeceras (CORS) para solicitudes HTTP
********************************************************************/
define("BASE_URL", "http://186.4.218.55:8082"); 

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, Authorization, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Allow: GET, POST, OPTIONS, PUT, DELETE");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

/********************************************************************
 Procesar las solicitudes HTTP con cURL (Equivalente a fetch en Node.js)
********************************************************************/

function procesarAPI($endpoint, $bodyData) {
    $url = BASE_URL . $endpoint;
    
    $jsonBody = json_encode($bodyData);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: ' . ($_SERVER['HTTP_AUTHORIZATION'] ?? '') // Tomar el JWT si se envía
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'http_code' => $http_code,
        'response'  => $response
    ];
}

/********************************************************************
 Método para validar inicio de sesión (Equivalente a Node.js)
********************************************************************/

function iniciarSesion() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

  
    if (!isset($data['codigo'])) {
        procesarRespuesta(400, ["error" => true, "message" => "Faltan parámetros"]);
        return;
    }

    $endpoint = '/login_Servicio';
    
    $result = procesarAPI($endpoint, ['codigo' => $data['codigo'], 'pwd' => $data['pwd']]);

    if ($result['http_code'] == 200) {
        header('Content-Type: text/plain');
        echo $result['response'];
    } else {
        procesarRespuesta(404, ["error" => true, "message" => "Usuario o contraseña incorrectos"]);
    }
}


/********************************************************************
 Procesar la respuesta para solicitudes HTTP
********************************************************************/

function procesarRespuesta($codigo, $datos) {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
}



/********************************************************************
    Método para realizar las peticiones API REST
*********************************************************************/
function API_Clientes() {
    $endpoint = "/api/clientes";
    $url = BASE_URL . $endpoint;

    $authorization = "";

    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $authorization = $headers['Authorization'];
        }
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);

    $headers = ['Content-Type: multipart/form-data'];
    if (!empty($authorization)) {
        $headers[] = "Authorization: $authorization";
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    http_response_code($http_code);
    echo $response;
}




/********************************************************************
    Validación de acciones para todos los métodos
********************************************************************/

if (isset($_GET['action'])) {
    $action = $_GET['action'];

    if ($action === 'iniciarSesion' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        iniciarSesion();
    } 

    else if ($action === 'API_Clientes' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        API_Clientes();
    } 

    else {
        procesarRespuesta(400, ["error" => true, "message" => "Acción no válida"]);
    }
} else {
    procesarRespuesta(400, ["error" => true, "message" => "No se especificó una acción"]);
}
?>
