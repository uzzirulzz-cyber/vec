import mongoose from 'mongoose';
import User from '../models/User';
import Model from '../models/Model';
import PromptTemplate from '../models/PromptTemplate';
import bcrypt from 'bcryptjs';

// Disable command buffering so queries fail or fallback immediately if DB is disconnected
mongoose.set('bufferCommands', false);

let connPromise: Promise<any> | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connPromise) {
    const customUri = process.env.MONGODB_URI || 'mongodb+srv://max11:c8g2aijs6jQjbb69@playbeat.umqpdyx.mongodb.net/?appName=playbeat';

    connPromise = mongoose
      .connect(customUri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      })
      .then(() => {
        console.log('MongoDB connected successfully.');
        seedInitialData().catch((err) => console.warn('Background seed notice:', err));
      })
      .catch((error) => {
        connPromise = null;
        console.warn('MongoDB connection notice:', error.message || error);
      });
  }

  // Await connection promise with 1.5s race timeout so serverless function never hangs
  try {
    await Promise.race([
      connPromise,
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch (err) {
    // Non-fatal, controllers handle readyState !== 1 gracefully
  }
};

const seedInitialData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    // 1. Seed Models if empty
    const modelCount = await Model.countDocuments().catch(() => 1);
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
      ]).catch(() => {});
    }

    // 2. Ensure Admin Accounts exist only if user table is empty or missing admin
    const userCount = await User.countDocuments().catch(() => 1);
    if (userCount === 0) {
      console.log('Seeding initial admin user accounts...');
      const pureSafeHash = await bcrypt.hash('creedbixby', 10);
      const adminPasswordHash = await bcrypt.hash('adminpassword123', 10);
      const userPasswordHash = await bcrypt.hash('demopassword123', 10);

      await User.create({
        name: 'Pure Safe Admin',
        email: 'admin@pure.safe',
        passwordHash: pureSafeHash,
        role: 'admin',
      }).catch(() => {});

      await User.create({
        name: 'User Admin',
        email: 'crdbixx@gmail.com',
        passwordHash: pureSafeHash,
        role: 'admin',
      }).catch(() => {});

      const admin = await User.create({
        name: 'System Administrator',
        email: 'admin@vectorengine.ai',
        passwordHash: adminPasswordHash,
        role: 'admin',
      }).catch(() => null);

      await User.create({
        name: 'Alex Developer',
        email: 'demo@vectorengine.ai',
        passwordHash: userPasswordHash,
        role: 'user',
      }).catch(() => {});

      if (admin && admin._id) {
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
        ]).catch(() => {});
      }
    }
  } catch (seedErr) {
    console.warn('Data seeding notice:', seedErr);
  }
};

