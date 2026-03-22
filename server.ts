import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import multer from 'multer';
import fs from 'fs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'gh-dutos-secret-2026';
const PORT = process.env.PORT || 3000;

// Setup multer for local uploads (fallback for Supabase/S3)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const checkAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }
    next();
  };

  // --- API ROUTES ---

  // Auth
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', authenticate, async (req, res) => {
    try {
      const totalEquipments = await prisma.equipment.count();
      const statusCounts = await prisma.equipment.groupBy({
        by: ['status'],
        _count: {
          _all: true
        }
      });
      const recentMaintenances = await prisma.maintenance.findMany({
        take: 5,
        orderBy: { data: 'desc' },
        include: { equipment: true }
      });

      // Smart Maintenance Alerts
      const allEquipments = await prisma.equipment.findMany({
        include: {
          maintenances: {
            orderBy: { data: 'desc' },
            take: 1
          }
        }
      });

      const now = new Date();
      let overdue = 0;
      let upcoming = 0;

      allEquipments.forEach(eq => {
        if (!eq.periodicidadeManutencao) return;

        const lastMaintenance = eq.maintenances[0]?.data || eq.dataInstalacao || eq.createdAt;
        const nextMaintenance = new Date(lastMaintenance);
        nextMaintenance.setDate(nextMaintenance.getDate() + eq.periodicidadeManutencao);

        const diffDays = Math.ceil((nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          overdue++;
        } else if (diffDays <= 15) {
          upcoming++;
        }
      });

      res.json({ 
        totalEquipments, 
        statusCounts, 
        recentMaintenances,
        maintenanceAlerts: { overdue, upcoming }
      });
    } catch (err) {
      console.error('Dashboard Stats Error:', err);
      res.status(500).json({ error: 'Erro ao carregar estatísticas' });
    }
  });

  // Equipments
  app.get('/api/equipments', authenticate, async (req, res) => {
    const equipments = await prisma.equipment.findMany({
      include: { attributes: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(equipments);
  });

  app.post('/api/equipments', authenticate, async (req, res) => {
    const { codigo, tipo, local, andar, status, dataInstalacao, periodicidadeManutencao, attributes } = req.body;
    const equipment = await prisma.equipment.create({
      data: {
        publicId: nanoid(10),
        codigo,
        tipo,
        local,
        andar,
        status,
        dataInstalacao: dataInstalacao ? new Date(dataInstalacao) : null,
        periodicidadeManutencao: parseInt(periodicidadeManutencao) || null,
        attributes: {
          create: attributes || []
        }
      }
    });
    res.json(equipment);
  });

  app.get('/api/equipments/:id', authenticate, async (req, res) => {
    const equipment = await prisma.equipment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { attributes: true, maintenances: { orderBy: { data: 'desc' } } }
    });
    res.json(equipment);
  });

  app.put('/api/equipments/:id', authenticate, async (req, res) => {
    const { codigo, tipo, local, andar, status, dataInstalacao, periodicidadeManutencao, attributes } = req.body;
    
    // Delete old attributes and recreate (simple sync)
    await prisma.equipmentAttribute.deleteMany({ where: { equipmentId: parseInt(req.params.id) } });

    const equipment = await prisma.equipment.update({
      where: { id: parseInt(req.params.id) },
      data: {
        codigo,
        tipo,
        local,
        andar,
        status,
        dataInstalacao: dataInstalacao ? new Date(dataInstalacao) : null,
        periodicidadeManutencao: parseInt(periodicidadeManutencao) || null,
        attributes: {
          create: attributes || []
        }
      }
    });
    res.json(equipment);
  });

  app.delete('/api/equipments/:id', authenticate, async (req, res) => {
    try {
      await prisma.equipment.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao excluir equipamento' });
    }
  });

  // Public Equipment Route
  app.get('/api/public/equipment/:publicId', async (req, res) => {
    const equipment = await prisma.equipment.findUnique({
      where: { publicId: req.params.publicId },
      include: { attributes: true, maintenances: { orderBy: { data: 'desc' } } }
    });
    if (!equipment) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json(equipment);
  });

  // Maintenances
  app.get('/api/maintenances', authenticate, async (req, res) => {
    const maintenances = await prisma.maintenance.findMany({
      include: { equipment: true },
      orderBy: { data: 'desc' }
    });
    res.json(maintenances);
  });

  app.post('/api/maintenances', authenticate, upload.single('arquivo'), async (req, res) => {
    const { equipmentId, data, descricao, responsavel, observacao } = req.body;
    const arquivoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const maintenance = await prisma.maintenance.create({
      data: {
        equipmentId: parseInt(equipmentId),
        data: new Date(data),
        descricao,
        responsavel,
        observacao,
        arquivoUrl
      }
    });
    res.json(maintenance);
  });

  // User Management
  app.get('/api/users', authenticate, checkAdmin, async (req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  });

  app.post('/api/users', authenticate, checkAdmin, async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name, role }
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(400).json({ error: 'Email já cadastrado' });
    }
  });

  app.put('/api/users/:id', authenticate, checkAdmin, async (req, res) => {
    const { email, password, name, role } = req.body;
    const data: any = { email, name, role };
    if (password) {
      data.password = bcrypt.hashSync(password, 10);
    }
    try {
      const user = await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao atualizar usuário' });
    }
  });

  app.delete('/api/users/:id', authenticate, checkAdmin, async (req, res) => {
    try {
      await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  });

  // Serve uploads
  app.use('/uploads', express.static('uploads'));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
