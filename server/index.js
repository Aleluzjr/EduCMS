const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'documents.json');

// Listar documentos
app.get('/api/documents', (req, res) => {
  const docs = readDocuments();
  // Paginação simples
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 25;
  const total = docs.length;
  const pageCount = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedData = docs.slice(start, end);
  res.json({
    data: pagedData,
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount,
        total
      }
    }
  });
});

// Criar documento
app.post('/api/documents', (req, res) => {
  const docs = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '[]');
  const newDoc = req.body;
  docs.push(newDoc);
  fs.writeFileSync(DATA_PATH, JSON.stringify(docs, null, 2));
  res.status(201).json(newDoc);
});

// Editar documento
app.put('/api/documents/:id', (req, res) => {
  const docs = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '[]');
  const idx = docs.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).send('Not found');
  docs[idx] = req.body;
  fs.writeFileSync(DATA_PATH, JSON.stringify(docs, null, 2));
  res.json(docs[idx]);
});

// Excluir documento
app.delete('/api/documents/:id', (req, res) => {
  let docs = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '[]');
  docs = docs.filter(d => d.id !== req.params.id);
  fs.writeFileSync(DATA_PATH, JSON.stringify(docs, null, 2));
  res.status(204).send();
});

app.listen(3001, () => console.log('API rodando em http://localhost:3001'));

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
  // Gera templates dinamicamente a partir dos slides dos documentos
  const documents = readDocuments();
  const slideTypes = {};
  documents.forEach(doc => {
    if (Array.isArray(doc.slides)) {
      doc.slides.forEach(slide => {
        const type = slide.__component;
        if (type && !slideTypes[type]) {
          slideTypes[type] = {
            id: type,
            name: type.replace('slides.', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            fields: Object.keys(slide)
              .filter(k => k !== '__component' && k !== 'id')
              .map(fieldName => ({ name: fieldName }))
          };
        }
      });
    }
  });
  res.json(Object.values(slideTypes));
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