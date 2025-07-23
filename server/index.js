import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectoryExists(path.join(__dirname, 'data'));
ensureDirectoryExists(path.join(__dirname, 'uploads'));

// File paths
const DOCUMENTS_FILE = path.join(__dirname, 'data', 'documents.json');
const TEMPLATES_FILE = path.join(__dirname, 'data', 'slide-templates.json');

// Initialize data files
const initializeDataFiles = () => {
  if (!fs.existsSync(DOCUMENTS_FILE)) {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(TEMPLATES_FILE)) {
    const defaultTemplates = [
      {
        id: 'slides.capa',
        name: 'Capa',
        icon: 'FileText',
        fields: [
          { name: 'title', type: 'text', label: 'Título', required: true },
          { name: 'description', type: 'textarea', label: 'Descrição' },
          { name: 'author', type: 'text', label: 'Autor' },
          { name: 'image', type: 'media', label: 'Imagem de Fundo' }
        ]
      },
      {
        id: 'slides.objetivos',
        name: 'Objetivos',
        icon: 'Target',
        fields: [
          { name: 'title', type: 'text', label: 'Título', defaultValue: 'Objetivos' },
          { name: 'objectivesList', type: 'repeatable', label: 'Lista de Objetivos', fields: [
            { name: 'title', type: 'text', label: 'Objetivo', required: true }
          ]}
        ]
      },
      {
        id: 'slides.texto-com-imagem',
        name: 'Texto com Imagem',
        icon: 'ImageIcon',
        fields: [
          { name: 'title', type: 'text', label: 'Título', required: true },
          { name: 'content', type: 'html', label: 'Conteúdo' },
          { name: 'image', type: 'media', label: 'Imagem' }
        ]
      },
      {
        id: 'slides.questao',
        name: 'Questão',
        icon: 'HelpCircle',
        fields: [
          { name: 'title', type: 'text', label: 'Título', required: true },
          { name: 'description', type: 'textarea', label: 'Pergunta', required: true },
          { name: 'answer', type: 'text', label: 'Resposta Correta (A, B, C, D)', required: true },
          { name: 'justification', type: 'html', label: 'Justificativa' },
          { name: 'Alternativas', type: 'repeatable', label: 'Alternativas', fields: [
            { name: 'title', type: 'text', label: 'Alternativa', required: true }
          ]}
        ]
      },
      {
        id: 'slides.texto-livre',
        name: 'Texto Livre',
        icon: 'AlignLeft',
        fields: [
          { name: 'title', type: 'text', label: 'Título' },
          { name: 'content', type: 'html', label: 'Conteúdo', required: true }
        ]
      },
      {
        id: 'slides.podcast',
        name: 'Podcast',
        icon: 'Mic',
        fields: [
          { name: 'title', type: 'text', label: 'Título', required: true },
          { name: 'description', type: 'textarea', label: 'Descrição' },
          { name: 'audio', type: 'media', label: 'Arquivo de Áudio', accept: 'audio/*' },
          { name: 'duration', type: 'text', label: 'Duração' }
        ]
      }
    ];
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(defaultTemplates, null, 2));
  }
};

initializeDataFiles();

// Helper functions
const readDocuments = () => {
  try {
    const data = fs.readFileSync(DOCUMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeDocuments = (documents) => {
  fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
};

const readTemplates = () => {
  try {
    const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeTemplates = (templates) => {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mp3|wav|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido!'));
    }
  }
});

// API Routes

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    formats: {
      large: { url: fileUrl },
      thumbnail: { url: fileUrl }
    }
  });
});

// Documents endpoints
app.get('/api/documents', (req, res) => {
  const documents = readDocuments();
  res.json(documents);
});

app.get('/api/documents/:id', (req, res) => {
  const documents = readDocuments();
  const document = documents.find(doc => doc.id === parseInt(req.params.id) || doc.documentId === req.params.id);
  
  if (!document) {
    return res.status(404).json({ error: 'Documento não encontrado' });
  }
  
  res.json(document);
});

app.post('/api/documents', (req, res) => {
  const documents = readDocuments();
  const newDocument = {
    id: documents.length > 0 ? Math.max(...documents.map(d => d.id)) + 1 : 1,
    documentId: uuidv4(),
    name: req.body.name || 'Novo Documento',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: req.body.publishedAt || null,
    slides: []
  };
  
  documents.push(newDocument);
  writeDocuments(documents);
  
  res.status(201).json(newDocument);
});

app.put('/api/documents/:id', (req, res) => {
  const documents = readDocuments();
  const index = documents.findIndex(doc => doc.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Documento não encontrado' });
  }
  
  documents[index] = {
    ...documents[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  writeDocuments(documents);
  res.json(documents[index]);
});

app.delete('/api/documents/:id', (req, res) => {
  const documents = readDocuments();
  const index = documents.findIndex(doc => doc.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Documento não encontrado' });
  }
  
  documents.splice(index, 1);
  writeDocuments(documents);
  
  res.json({ message: 'Documento excluído com sucesso' });
});

// Slide templates endpoints
app.get('/api/slide-templates', (req, res) => {
  const templates = readTemplates();
  res.json(templates);
});

app.post('/api/slide-templates', (req, res) => {
  const templates = readTemplates();
  const newTemplate = {
    id: req.body.id || `slides.${req.body.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: req.body.name,
    icon: req.body.icon || 'FileText',
    fields: req.body.fields || []
  };
  
  templates.push(newTemplate);
  writeTemplates(templates);
  
  res.status(201).json(newTemplate);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📄 API disponível em http://localhost:${PORT}/api`);
});