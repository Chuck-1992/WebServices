
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');

const app = express();
const upload = multer();
const port = 3000;
const URL = "http://186.4.218.55:8082";


// Carga del archivo HTML
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Imporación de cabeceras para los CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


/********************************************************************
  Método para validar inicio de sesión
*********************************************************************/
app.post('/proxy/login_Servicio', async (req, res) => {

  try {
    const realUrl = URL + '/login_Servicio';

    const response = await fetch(realUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(req.body)
    });

    const data = await response.text();

    return res.status(response.status).send(data);

  } catch (error) {
    console.error('Error en proxy:', error);
    return res.status(500).json({ error: 'Error en el proxy al hacer login_Servicio' });
  }
});



/********************************************************************
   Método para crear el token WEB
*********************************************************************/
app.post('/proxy/login', async (req, res) => {
  try {

    const realUrl = URL + '/api/login';
    const response = await fetch(realUrl, {
      credentials: 'include',
      method: 'POST',
      headers: {

        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      },
      body: JSON.stringify(req.body)
    });


    const data = await response.text();
    return res.status(response.status).send(data);

  } catch (error) {
    console.error('Error en proxy /proxy/login:', error);
    return res.status(500).json({ error: 'Error en el proxy al hacer /proxy/login' });
  }
});



/********************************************************************
  Método para obtener el status de las solcitudes HTTP
*********************************************************************/

app.post("/proxy/estatus", async (req, res) => {

  try {

    const realUrl = URL + "/estatus";
    const response = await fetch(realUrl, {
      method: "POST",
      headers: {
        "Authorization": req.headers.authorization || ""
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error("Error en proxy /proxy/estatus:", error);
    res.status(500).json({ error: "Error en el proxy al hacer /estatus" });
  }
});



/********************************************************************
  Método para realizar peticion con el respectivo Status
*********************************************************************/
app.post('/proxy/mba3/orda', upload.none(), async (req, res) => {
  try {

    const realUrl = URL + '/mba3/orda';

    const form = new FormData();
    for (const [key, value] of Object.entries(req.body)) {
      form.append(key, value);
    }


    const response = await fetch(realUrl, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.authorization || ''
      },
      body: form
    });

    const text = await response.text();
    res.status(response.status).send(text);

  } catch (error) {
    console.error('Error en proxy /proxy/mba3/orda:', error);
    res.status(500).json({ error: 'Proxy error al reenviar a /mba3/orda' });
  }
});



/********************************************************************
   Método para realizar solcitudes continuas a modo de ataque DOS
*********************************************************************/
app.get("/proxy/estatus", async (req, res) => {
  try {
    const realUrl = URL + "/estatus";

    const response = await fetch(realUrl, {
      method: "GET",
      headers: {
        "Authorization": req.headers.authorization || ""
      }
    });

    const text = await response.text();
    res.status(response.status).send(text);

  } catch (error) {
    console.error("Error en /proxy/estatus (GET):", error);
    res.status(500).json({ error: "Proxy error al llamar /estatus" });
  }
});



/********************************************************************
   Método para realizar consultar Externas de Clientes a MBA3
*********************************************************************/
app.post('/proxy/ws_Consulta_externa_MBA3/', upload.none(), async (req, res) => {
  try {

    const realUrl = URL + '/ws_Consulta_externa_MBA3/';
    const form = new FormData();
    for (const [key, value] of Object.entries(req.body)) {
      form.append(key, value);
    }

    const response = await fetch(realUrl, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.authorization || ''
      },
      body: form
    });

    const text = await response.text();
    res.status(response.status).send(text);

  } catch (error) {
    console.error('Error en proxy /proxy/ws_Consulta_externa_MBA3/:', error);
    res.status(500).json({ error: 'Error en proxy /ws_Consulta_externa_MBA3/' });
  }
});



/********************************************************************
    Método para realizar las peticiones API REST
*********************************************************************/
app.post('/proxy/api/clientes', upload.none(), async (req, res) => {
  try {

    const realUrl = URL + '/api/clientes';
    const form = new FormData();
    for (const [key, value] of Object.entries(req.body)) {
      form.append(key, value);
    }


    const response = await fetch(realUrl, {
      credentials: 'include',
      maxBodyLength: Infinity,
      mode: "cors",
      method: 'POST',
      headers: {
        'Authorization': req.headers.authorization || ''
      },
      body: form
    });


    const text = await response.text();
    res.status(response.status).send(text);

  } catch (error) {
    console.error('Error en /proxy/api/clientes:', error);
    res.status(500).json({ error: 'Error en proxy /proxy/api/clientes' });
  }
});




/********************************************************************
   Método para iniciar el servidor
*********************************************************************/
//"192.168.1.58"
app.listen(port, () => {
  console.log(`Servidor iniciado en localhost:${port}`);
  console.log('Sirviendo archivos estáticos desde /public');
});
