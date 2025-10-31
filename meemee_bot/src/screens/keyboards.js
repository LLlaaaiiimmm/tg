import { KEYBOARDS } from '../config.js';
import { loadActiveMemes } from '../utils/memeLoader.js';

// Генерация клавиатуры каталога с пагинацией
export function createCatalogKeyboard(page = 0, itemsPerPage = 5) {
    const memes = loadActiveMemes();
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pageMemes = memes.slice(start, end);
    
    const buttons = pageMemes.map(meme => {
        const emoji = meme.status === 'soon' ? '⏳ ' : '🎬 ';
        return [{
            text: emoji + meme.name,
            callback_data: `meme_${meme.id}`
        }];
    });
    
    // Кнопки навигации
    const navButtons = [];
    if (page > 0) {
        navButtons.push({
            text: '⬅️ Назад',
            callback_data: `catalog_page_${page - 1}`
        });
    }
    if (end < memes.length) {
        navButtons.push({
            text: '➡️ Далее',
            callback_data: `catalog_page_${page + 1}`
        });
    }
    
    if (navButtons.length > 0) {
        buttons.push(navButtons);
    }
    
    buttons.push([{
        text: '🔙 Главное меню',
        callback_data: 'main_menu'
    }]);
    
    return { inline_keyboard: buttons };
}

// Генерация клавиатуры для выбора криптовалюты
export function createCryptoKeyboard(packageKey = 'single') {
    return {
        inline_keyboard: [
            [{ text: '💵 USDT', callback_data: `crypto_USDT_${packageKey}` }],
            [{ text: '💰 USDC', callback_data: `crypto_USDC_${packageKey}` }],
            [{ text: '💎 TON', callback_data: `crypto_TON_${packageKey}` }],
            [{ text: '🔙 Назад', callback_data: `select_package_${packageKey}` }]
        ]
    };
}

// Генерация клавиатуры для выбора сети
export function createChainKeyboard(crypto, chains, packageKey = 'single') {
    const buttons = chains.map(chain => [{
        text: chain.name,
        callback_data: `chain_${crypto}_${chain.processing.replace(/\s+/g, '_')}_${packageKey}`
    }]);
    
    buttons.push([{
        text: '🔙 Назад',
        callback_data: `pay_crypto_${packageKey}`
    }]);
    
    return { inline_keyboard: buttons };
}

// Генерация клавиатуры для оплаты криптой
export function createPaymentCryptoKeyboard(orderId) {
    return {
        inline_keyboard: [
            [{ text: '✅ Я оплатил', callback_data: `check_payment_${orderId}` }],
            [{ text: '🔙 Назад', callback_data: 'buy' }]
        ]
    };
}

// Генерация клавиатуры после успешной оплаты
export function createAfterPaymentKeyboard() {
    return {
        inline_keyboard: [
            [{ text: '🎬 Запустить генерацию', callback_data: 'catalog' }],
            [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
        ]
    };
}

export { KEYBOARDS };
