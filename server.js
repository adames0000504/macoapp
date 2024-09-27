 HEAD
// 1. Configuración de la API de Google Drive
const express = require('express'); // Importa Express para crear el servidor
const { google } = require('googleapis'); // Importa la librería de Google para usar Google Drive
const dotenv = require('dotenv'); // Para usar variables de entorno
const multer = require('multer'); // Para manejar la subida de archivos
const fs = require('fs'); // Para manejar el sistema de archivos
const path = require('path'); // Para manejar rutas de archivos

dotenv.config(); // Carga las variables de entorno del archivo .env

const app = express(); // Crea una aplicación Express

app.use(express.static('public')); // Sirve archivos estáticos de la carpeta 'public'

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID, // Llave de cliente de Google (la guardamos en el archivo .env)
  process.env.CLIENT_SECRET, // Secreto de cliente de Google (también en .env)
  process.env.REDIRECT_URI // URI de redirección donde Google enviará al usuario después de iniciar sesión
);

// Definimos los permisos que queremos: en este caso, permiso para subir archivos a Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Configura multer para guardar archivos en una carpeta temporal
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Asegúrate de que esta carpeta exista
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Agrega una marca de tiempo para evitar conflictos
    },
});

const upload = multer({ storage: storage });

// 2. Autenticación con OAuth 2.0 (Iniciar sesión con Google)
// Esta ruta redirige al usuario a la página de inicio de sesión de Google
app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(url); // Redirigimos al usuario a Google
});

// Callback de autenticación
app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query; // Captura el código de la URL
    try {
        const { tokens } = await oauth2Client.getToken(code); // Intercambiamos el código por un token de acceso
        oauth2Client.setCredentials(tokens); // Guardamos el token para futuras peticiones
        res.send('Autenticado con éxito. <a href="/files">Ver archivos en Google Drive</a>'); // Enlace para ver archivos
    } catch (error) {
        console.error('Error autenticando con Google:', error);
        res.status(500).send('Error autenticando con Google');
    }
});


// 3. Subir Archivos a Google Drive
app.post('/upload', upload.single('file'), async (req, res) => {
    const drive = google.drive({ version: 'v3', auth: oauth2Client }); // Creamos una instancia de Google Drive con la autenticación
    const file = req.file;

    // Verifica si el archivo fue subido
    if (!file) {
        return res.status(400).send('No se ha subido ningún archivo.');
    }

    // Datos del archivo para Google Drive
    const fileMetadata = {
        name: file.originalname,
    };

    // Contenido del archivo
    const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
    };

    try {
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        fs.unlinkSync(file.path); // Elimina el archivo temporal después de subirlo a Google Drive

        // Devuelve el ID del archivo subido
        res.send(`Archivo subido con éxito, ID: ${response.data.id}`);
    } catch (error) {
        console.error('Error al subir archivo a Google Drive:', error.message);
        console.error('Detalles del error:', error); // Imprime más detalles del error en la consola
        res.status(500).send('Error subiendo archivo a Google Drive: ' + error.message);
    }
});

// 4. Consultar Archivos en Google Drive
app.get('/files', async (req, res) => {
    const drive = google.drive({ version: 'v3', auth: oauth2Client }); // Instancia de Google Drive autenticada
    try {
        const response = await drive.files.list({
            pageSize: 100, // Número de archivos a listar
            fields: 'files(id, name)', // Campos que queremos que devuelva Google Drive (ID y nombre)
        });

        res.send(response.data.files); // Enviamos la lista de archivos al navegador
    } catch (error) {
        console.error('Error listando archivos en Google Drive:', error.message);
        res.status(500).send('Error listando archivos en Google Drive: ' + error.message);
    }
});


// Arranca el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor funcionando en http://localhost:3000');
});

// 1. Configuración de la API de Google Drive
const express = require('express'); // Importa Express para crear el servidor
const { google } = require('googleapis'); // Importa la librería de Google para usar Google Drive
const dotenv = require('dotenv'); // Para usar variables de entorno
const multer = require('multer'); // Para manejar la subida de archivos
const fs = require('fs'); // Para manejar el sistema de archivos
const path = require('path'); // Para manejar rutas de archivos

dotenv.config(); // Carga las variables de entorno del archivo .env

const app = express(); // Crea una aplicación Express

app.use(express.static('public')); // Sirve archivos estáticos de la carpeta 'public'

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID, // Llave de cliente de Google (la guardamos en el archivo .env)
  process.env.CLIENT_SECRET, // Secreto de cliente de Google (también en .env)
  process.env.REDIRECT_URI // URI de redirección donde Google enviará al usuario después de iniciar sesión
);

// Definimos los permisos que queremos: en este caso, permiso para subir archivos a Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Configura multer para guardar archivos en una carpeta temporal
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Asegúrate de que esta carpeta exista
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Agrega una marca de tiempo para evitar conflictos
    },
});

const upload = multer({ storage: storage });

// 2. Autenticación con OAuth 2.0 (Iniciar sesión con Google)
// Esta ruta redirige al usuario a la página de inicio de sesión de Google
app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(url); // Redirigimos al usuario a Google
});

// Callback de autenticación
app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query; // Captura el código de la URL
    try {
        const { tokens } = await oauth2Client.getToken(code); // Intercambiamos el código por un token de acceso
        oauth2Client.setCredentials(tokens); // Guardamos el token para futuras peticiones
        res.send('Autenticado con éxito. <a href="/files">Ver archivos en Google Drive</a>'); // Enlace para ver archivos
    } catch (error) {
        console.error('Error autenticando con Google:', error);
        res.status(500).send('Error autenticando con Google');
    }
});


// 3. Subir Archivos a Google Drive
app.post('/upload', upload.single('file'), async (req, res) => {
    const drive = google.drive({ version: 'v3', auth: oauth2Client }); // Creamos una instancia de Google Drive con la autenticación
    const file = req.file;

    // Verifica si el archivo fue subido
    if (!file) {
        return res.status(400).send('No se ha subido ningún archivo.');
    }

    // Datos del archivo para Google Drive
    const fileMetadata = {
        name: file.originalname,
    };

    // Contenido del archivo
    const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
    };

    try {
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        fs.unlinkSync(file.path); // Elimina el archivo temporal después de subirlo a Google Drive

        // Devuelve el ID del archivo subido
        res.send(`Archivo subido con éxito, ID: ${response.data.id}`);
    } catch (error) {
        console.error('Error al subir archivo a Google Drive:', error.message);
        console.error('Detalles del error:', error); // Imprime más detalles del error en la consola
        res.status(500).send('Error subiendo archivo a Google Drive: ' + error.message);
    }
});

// 4. Consultar Archivos en Google Drive
app.get('/files', async (req, res) => {
    const drive = google.drive({ version: 'v3', auth: oauth2Client }); // Instancia de Google Drive autenticada
    try {
        const response = await drive.files.list({
            pageSize: 10, // Número de archivos a listar
            fields: 'files(id, name)', // Campos que queremos que devuelva Google Drive (ID y nombre)
        });

        res.send(response.data.files); // Enviamos la lista de archivos al navegador
    } catch (error) {
        console.error('Error listando archivos en Google Drive:', error.message);
        res.status(500).send('Error listando archivos en Google Drive: ' + error.message);
    }
});


// Arranca el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor funcionando en http://localhost:3000');
});
 1ff950a (Primer commit)
