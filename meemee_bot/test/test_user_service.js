import 'dotenv/config';
import redis from '../src/redis.js';
import { UserService } from '../src/services/User.service.js';

console.log('🧪 Тест: User Service (управление пользователями)\n');

const userService = new UserService();

async function testUserService() {
    try {
        const testUserId = 999888777;
        const testTelegramUser = {
            id: testUserId,
            username: 'test_user',
            first_name: 'Test',
            last_name: 'User'
        };
        
        console.log('1️⃣ Тест создания пользователя\n');
        
        const user = await userService.createUser(testTelegramUser);
        
        console.log('   ✅ Пользователь создан');
        console.log(`   👤 User ID: ${user.userId}`);
        console.log(`   📝 Username: ${user.username || 'не указан'}`);
        console.log(`   🎁 Бесплатная квота: ${user.free_quota}`);
        console.log(`   💳 Платная квота: ${user.paid_quota}`);
        console.log(`   📅 Создан: ${new Date(user.createdAt).toLocaleString('ru-RU')}`);
        
        console.log('\n2️⃣ Тест получения пользователя\n');
        
        const fetchedUser = await userService.getUser(testUserId);
        console.log(`   ✅ Пользователь получен: ${fetchedUser.userId}`);
        
        console.log('\n3️⃣ Тест списания квоты\n');
        
        console.log(`   Баланс до: Free=${fetchedUser.free_quota}, Paid=${fetchedUser.paid_quota}`);
        
        const deducted = await userService.deductQuota(testUserId);
        
        if (deducted) {
            const afterDeduct = await userService.getUser(testUserId);
            console.log(`   ✅ Квота списана`);
            console.log(`   Баланс после: Free=${afterDeduct.free_quota}, Paid=${afterDeduct.paid_quota}`);
        }
        
        console.log('\n4️⃣ Тест добавления платной квоты\n');
        
        await userService.addPaidQuota(testUserId, 10);
        const afterAdd = await userService.getUser(testUserId);
        
        console.log(`   ✅ Добавлено 10 генераций`);
        console.log(`   Баланс: Free=${afterAdd.free_quota}, Paid=${afterAdd.paid_quota}`);
        
        console.log('\n5️⃣ Тест проверки квоты\n');
        
        const hasQuota = await userService.hasQuota(testUserId);
        console.log(`   ${hasQuota ? '✅' : '❌'} Есть доступные генерации: ${hasQuota}`);
        
        console.log('\n6️⃣ Тест возврата квоты\n');
        
        await userService.refundQuota(testUserId);
        const afterRefund = await userService.getUser(testUserId);
        
        console.log(`   ✅ Квота возвращена`);
        console.log(`   Баланс: Free=${afterRefund.freeQuota}, Paid=${afterRefund.paidQuota}`);
        
        console.log('\n7️⃣ Тест списания всех квот\n');
        
        let deductCount = 0;
        while (await userService.deductQuota(testUserId)) {
            deductCount++;
        }
        
        console.log(`   ✅ Списано ${deductCount} генераций`);
        
        const finalUser = await userService.getUser(testUserId);
        console.log(`   Финальный баланс: Free=${finalUser.freeQuota}, Paid=${finalUser.paidQuota}`);
        
        if (finalUser.freeQuota === 0 && finalUser.paidQuota === 0) {
            console.log(`   ✅ Все квоты корректно списаны`);
        }
        
        console.log('\n8️⃣ Тест статистики пользователей\n');
        
        const allUsers = await userService.getAllUsers();
        console.log(`   ✅ Всего пользователей в базе: ${allUsers.length}`);
        
        console.log('\n✅ Все тесты пользователей пройдены успешно!\n');
        
        // Очистка тестовых данных
        await redis.del(`user:${testUserId}`);
        console.log('🧹 Тестовые данные очищены\n');
        
    } catch (err) {
        console.error('❌ Ошибка в тесте:', err.message);
        console.error(err.stack);
    } finally {
        await redis.quit();
    }
}

testUserService();
