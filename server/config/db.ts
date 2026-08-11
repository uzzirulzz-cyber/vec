import mongoose from 'mongoose';
import User from '../models/User';
import Model from '../models/Model';
import PromptTemplate from '../models/PromptTemplate';
import bcrypt from 'bcryptjs';

let mongoMemoryServer: any = null;

export const connectDB = async (): Promise<void> => {
  const customUri = process.env.MONGODB_URI || 'mongodb+srv://max11:c8g2aijs6jQjbb69@playbeat.umqpdyx.mongodb.net/?appName=playbeat';

  try {
    if (customUri && !customUri.includes('127.0.0.1') && !customUri.includes('localhost')) {
      console.log(`Connecting to MongoDB at ${customUri.substring(0, 30)}...`);
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 8000 });
      console.log('MongoDB connected successfully to external URI.');
    } else {
      // Try local MongoDB, if it fails within 1.5s, fallback to MongoMemoryServer
      try {
        console.log('Attempting connection to local MongoDB...');
        await mongoose.connect(customUri || 'mongodb://127.0.0.1:27017/vectorengine_ai', {
          serverSelectionTimeoutMS: 1500,
        });
        console.log('Connected to local MongoDB.');
      } catch (localErr) {
        console.log('Local MongoDB not running. Initializing in-memory MongoDB server...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`In-memory MongoDB connected successfully at ${memoryUri}`);
      }
    }

    await seedInitialData();
  } catch (error) {
    console.error('MongoDB connection error, starting fallback memory server:', error);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log('Fallback In-memory MongoDB connected successfully.');
      await seedInitialData();
    } catch (memErr) {
      console.error('Fatal: Could not start MongoDB database', memErr);
    }
  }
};

const seedInitialData = async () => {
  try {
    // 1. Seed Models if empty
    const modelCount = await Model.countDocuments();
    if (modelCount === 0) {
      console.log('Seeding initial VectorEngine model catalog...');
      await Model.insertMany([
        {
          name: 'VectorEngine GPT-4o',
          modelId: 'vectorengine-gpt-4o',
          provider: 'VectorEngine',
          type: 'chat',
          capabilities: ['chat', 'reasoning', 'coding'],
          description: 'High-intelligence flagship model for complex chat, reasoning, and multi-turn coding tasks.',
          enabled: true,
          maxTokens: 4096,
          contextWindow: 128000,
        },
        {
          name: 'VectorEngine Coder Pro',
          modelId: 'vectorengine-coder-pro',
          provider: 'VectorEngine',
          type: 'coding',
          capabilities: ['chat', 'coding', 'reasoning'],
          description: 'Specialized low-latency model optimized for code generation, code review, and architecture debugging.',
          enabled: true,
          maxTokens: 8192,
          contextWindow: 128000,
        },
        {
          name: 'VectorEngine Reasoning X1',
          modelId: 'vectorengine-reasoning-x1',
          provider: 'VectorEngine',
          type: 'reasoning',
          capabilities: ['chat', 'reasoning'],
          description: 'Deep chain-of-thought model engineered for logic puzzles, mathematical proofs, and analytical problems.',
          enabled: true,
          maxTokens: 4096,
          contextWindow: 64000,
        },
        {
          name: 'VectorEngine Vision Pro',
          modelId: 'vectorengine-vision-v1',
          provider: 'VectorEngine',
          type: 'vision',
          capabilities: ['chat', 'vision'],
          description: 'Multimodal vision model capable of analyzing diagrams, code screenshots, UI mockups, and complex images.',
          enabled: true,
          maxTokens: 4096,
          contextWindow: 128000,
        },
        {
          name: 'VectorEngine Imagine 3.0',
          modelId: 'vectorengine-dall-e-3',
          provider: 'VectorEngine',
          type: 'image',
          capabilities: ['image'],
          description: 'Next-gen text-to-image synthesis model generating ultra-photorealistic and creative artistic visual graphics.',
          enabled: true,
          maxTokens: 1,
          contextWindow: 2000,
        },
        {
          name: 'VectorEngine Embed Large',
          modelId: 'vectorengine-embed-large',
          provider: 'VectorEngine',
          type: 'embeddings',
          capabilities: ['embeddings'],
          description: 'High-density 1536-dimensional text embeddings model for RAG, semantic search, and document retrieval.',
          enabled: true,
          maxTokens: 512,
          contextWindow: 8192,
        },
      ]);
    }

    // 2. Seed Admin and User if empty
    const adminUser = await User.findOne({ email: 'admin@vectorengine.ai' });
    if (!adminUser) {
      console.log('Seeding default Admin and Demo user...');
      const adminPasswordHash = await bcrypt.hash('adminpassword123', 10);
      const userPasswordHash = await bcrypt.hash('demopassword123', 10);

      const admin = await User.create({
        name: 'System Administrator',
        email: 'admin@vectorengine.ai',
        passwordHash: adminPasswordHash,
        role: 'admin',
      });

      const demoUser = await User.create({
        name: 'Alex Developer',
        email: 'demo@vectorengine.ai',
        passwordHash: userPasswordHash,
        role: 'user',
      });

      // Seed default Prompt Templates created by admin
      await PromptTemplate.insertMany([
        {
          name: 'Code Review & Refactor',
          category: 'Coding',
          prompt: 'Review the following code snippet for readability, efficiency, security vulnerabilities, and adherence to clean code principles:\n\n```\n// Insert code here\n```',
          model: 'vectorengine-coder-pro',
          createdBy: admin._id,
          isPublic: true,
        },
        {
          name: 'Executive Summary Generator',
          category: 'Business',
          prompt: 'Synthesize the provided text into a concise 3-paragraph executive summary with key takeaways and strategic action points:',
          model: 'vectorengine-gpt-4o',
          createdBy: admin._id,
          isPublic: true,
        },
        {
          name: 'Product Launch Marketing Copy',
          category: 'Marketing',
          prompt: 'Draft an engaging product launch email and 3 social media posts (X/LinkedIn) promoting a new developer tool.',
          model: 'vectorengine-gpt-4o',
          createdBy: admin._id,
          isPublic: true,
        },
        {
          name: 'Step-by-Step Architecture Guide',
          category: 'Research',
          prompt: 'Explain the internal mechanics of high-throughput message queues (e.g. Kafka vs RabbitMQ) for a senior systems engineer.',
          model: 'vectorengine-reasoning-x1',
          createdBy: admin._id,
          isPublic: true,
        },
      ]);
    }
  } catch (seedErr) {
    console.error('Error seeding initial database:', seedErr);
  }
};
