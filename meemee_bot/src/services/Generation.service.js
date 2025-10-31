import 'dotenv/config';
import axios from 'axios';
import redis from '../redis.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GenerationService {
    constructor() {
        this.apiKey = process.env.GOOGLE_VEO3_API_KEY;
        // Google Veo 3.1 API endpoint (через Gemini API)
        this.apiUrl = `https://generativelanguage.googleapis.com/v1beta`;
        this.modelName = 'veo-3.1-generate-preview';
    }

    // Загрузка промпта мема
    loadMemePrompt(memeId) {
        try {
            const memePath = path.join(__dirname, '../memes', `${memeId}.json`);
            const memeData = JSON.parse(fs.readFileSync(memePath, 'utf8'));
            return memeData;
        } catch (err) {
            console.error(`❌ Error loading meme ${memeId}: ${err.message}`);
            return null;
        }
    }

    // Создание генерации
    async createGeneration({ userId, memeId, name, gender }) {
        try {
            const generationId = this.generateId();
            const memeData = this.loadMemePrompt(memeId);

            if (!memeData) {
                return { error: 'Мем не найден' };
            }

            const genderText = gender === 'male' ? 'мальчик' : 'девочка';
            const prompt = memeData.prompt
                .replace('{name}', name)
                .replace('{gender}', gender)
                .replace('{gender_text}', genderText);

            const generation = {
                generationId,
                userId,
                memeId,
                memeName: memeData.name,
                name,
                gender,
                prompt,
                status: 'queued',
                videoUrl: null,
                error: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await redis.set(`generation:${generationId}`, JSON.stringify(generation));
            await redis.lpush('generation_queue', generationId);
            await redis.lpush(`user_generations:${userId}`, generationId);

            console.log(`🎬 Generation ${generationId} created for user ${userId}`);

            // Запуск генерации асинхронно
            this.processGeneration(generationId).catch(err => {
                console.error(`❌ Error processing generation ${generationId}: ${err.message}`);
            });

            return generation;
        } catch (err) {
            console.error(`❌ Error creating generation: ${err.message}`);
            return { error: err.message };
        }
    }

    // Обработка генерации
    async processGeneration(generationId) {
        try {
            const generation = await this.getGeneration(generationId);
            if (!generation) return;

            // Обновляем статус
            await this.updateGeneration(generationId, { status: 'processing' });

            // Вызов Google Veo3 API
            const videoUrl = await this.generateVideo(generation.prompt);

            if (videoUrl) {
                await this.updateGeneration(generationId, {
                    status: 'done',
                    videoUrl: videoUrl
                });
                console.log(`✅ Generation ${generationId} completed successfully`);
            } else {
                throw new Error('Failed to generate video');
            }
        } catch (err) {
            console.error(`❌ Generation ${generationId} failed: ${err.message}`);
            await this.updateGeneration(generationId, {
                status: 'failed',
                error: err.message
            });
        }
    }

    // Генерация видео через Google Veo3 API
    async generateVideo(prompt) {
        try {
            if (!this.apiKey) {
                throw new Error('Google Veo3 API key not configured');
            }

            console.log('🎬 Starting video generation with Veo3...');
            console.log('Prompt:', prompt);

            // Реальный API запрос к Google Veo 3.1
            const response = await axios.post(
                `${this.apiUrl}/models/${this.modelName}:generateContent?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        responseCount: 1,
                        aspectRatio: '16:9',
                        duration: 5
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 300000 // 5 минут
                }
            );

            console.log('API Response:', JSON.stringify(response.data, null, 2));

            // Обработка ответа
            if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                const candidate = response.data.candidates[0];
                
                // Если видео готово сразу
                if (candidate.content && candidate.content.parts && candidate.content.parts[0].video) {
                    const videoUri = candidate.content.parts[0].video.uri;
                    console.log('✅ Video URL received:', videoUri);
                    return videoUri;
                }
                
                // Если есть operation ID для polling
                if (response.data.name || response.data.operation) {
                    const operationName = response.data.name || response.data.operation;
                    console.log('⏳ Operation started:', operationName);
                    return await this.pollVideoGeneration(operationName);
                }
            }

            throw new Error('Invalid API response: no video or operation ID');
        } catch (err) {
            console.error(`❌ Video generation error: ${err.message}`);
            if (err.response) {
                console.error('API Error Response:', err.response.data);
            }
            throw err;
        }
    }

    // Polling для проверки статуса генерации
    async pollVideoGeneration(operationName, maxAttempts = 60, interval = 5000) {
        console.log('⏳ Starting polling for operation:', operationName);
        
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await axios.get(
                    `${this.apiUrl}/${operationName}?key=${this.apiKey}`,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log(`Polling attempt ${i + 1}/${maxAttempts}...`);

                // Проверяем статус операции
                if (response.data.done === true) {
                    if (response.data.error) {
                        throw new Error(response.data.error.message || 'Generation failed');
                    }
                    
                    // Видео готово
                    if (response.data.response && response.data.response.candidates) {
                        const candidate = response.data.response.candidates[0];
                        if (candidate.content && candidate.content.parts && candidate.content.parts[0].video) {
                            const videoUri = candidate.content.parts[0].video.uri;
                            console.log('✅ Video generation completed:', videoUri);
                            return videoUri;
                        }
                    }
                    
                    throw new Error('Operation completed but no video found');
                }

                // Ждём перед следующей попыткой
                await new Promise(resolve => setTimeout(resolve, interval));
            } catch (err) {
                console.error(`❌ Polling error: ${err.message}`);
                
                // Если это последняя попытка, пробрасываем ошибку
                if (i === maxAttempts - 1) {
                    throw err;
                }
                
                // Иначе ждём и пробуем снова
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }

        throw new Error('Video generation timeout after ' + (maxAttempts * interval / 1000) + ' seconds');
    }

    // Получение генерации
    async getGeneration(generationId) {
        const data = await redis.get(`generation:${generationId}`);
        return data ? JSON.parse(data) : null;
    }

    // Обновление генерации
    async updateGeneration(generationId, data) {
        const generation = await this.getGeneration(generationId);
        if (!generation) return null;

        const updated = {
            ...generation,
            ...data,
            updatedAt: new Date().toISOString()
        };

        await redis.set(`generation:${generationId}`, JSON.stringify(updated));
        return updated;
    }

    // Получение генераций пользователя
    async getUserGenerations(userId) {
        const generationIds = await redis.lrange(`user_generations:${userId}`, 0, -1);
        const generations = [];

        for (const id of generationIds) {
            const gen = await this.getGeneration(id);
            if (gen) generations.push(gen);
        }

        return generations;
    }

    // Генерация ID
    generateId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `GEN-${timestamp}-${random}`;
    }

    // Получение статистики генераций
    async getGenerationStats() {
        const queueLength = await redis.llen('generation_queue');
        
        // Получаем все ID генераций (можно оптимизировать)
        const allKeys = await redis.keys('generation:*');
        const stats = {
            total: allKeys.length,
            queued: 0,
            processing: 0,
            done: 0,
            failed: 0
        };

        for (const key of allKeys) {
            const gen = await redis.get(key);
            if (gen) {
                const { status } = JSON.parse(gen);
                stats[status] = (stats[status] || 0) + 1;
            }
        }

        return { ...stats, queueLength };
    }

    // Получение топ мемов
    async getTopMemes() {
        const allKeys = await redis.keys('generation:*');
        const memeCounts = {};

        for (const key of allKeys) {
            const gen = await redis.get(key);
            if (gen) {
                const { memeId, memeName, status } = JSON.parse(gen);
                if (status === 'done') {
                    if (!memeCounts[memeId]) {
                        memeCounts[memeId] = { memeId, memeName, count: 0 };
                    }
                    memeCounts[memeId].count++;
                }
            }
        }

        return Object.values(memeCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
}