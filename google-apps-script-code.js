// ============================================
// ПОЛНЫЙ КОД ДЛЯ GOOGLE APPS SCRIPT
// Landing SOP - Обработка формы
// ============================================

// ⚠️ ВАЖНО: Замените на ID вашей таблицы
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// ⚠️ ВАЖНО: Укажите email для получения уведомлений
const NOTIFICATION_EMAIL = 'noise8301@gmail.com';

// Максимальная длина текстовых полей
const MAX_LENGTH = 1000;

// ============================================
// CORS SUPPORT
// ============================================

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// ============================================
// ОБРАБОТКА POST ЗАПРОСОВ (форма отправки)
// ============================================

function doPost(e) {
  try {
    // 1. Проверка Content-Type
    if (!e.postData || e.postData.type !== 'application/json') {
      return createErrorResponse('Invalid content type');
    }
    
    const data = JSON.parse(e.postData.contents);
    
    // 2. Валидация обязательных полей
    if (!data.name || !data.email || !data.message) {
      return createErrorResponse('Отсутствуют обязательные поля');
    }
    
    // 3. Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return createErrorResponse('Неверный формат email');
    }
    
    // 4. Проверка длины полей (защита от переполнения)
    if (data.message && data.message.length > MAX_LENGTH) {
      return createErrorResponse('Сообщение слишком длинное');
    }
    
    // 5. Honeypot проверка (защита от ботов)
    if (data.website) {
      logSuspiciousActivity('Honeypot triggered', data, SPREADSHEET_ID);
      return createErrorResponse('Bot detected');
    }
    
    // 6. Санитизация данных (удаление лишних символов, обрезка)
    const sanitize = (str) => str ? str.toString().substring(0, MAX_LENGTH).trim() : '';
    
    // 7. Открываем лист "Заявки"
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Заявки');
    
    if (!sheet) {
      return createErrorResponse('Лист "Заявки" не найден. Запустите setupSheet() для настройки таблицы.');
    }
    
    // 8. Сохранение данных в таблицу
    sheet.appendRow([
      new Date(data.timestamp),
      sanitize(data.name),
      sanitize(data.farm),
      sanitize(data.email),
      sanitize(data.phone),
      sanitize(data['farm-type']),
      sanitize(data['farm-size']),
      sanitize(data.message)
    ]);
    
    // 9. Отправка email уведомления
    sendEmailNotification(data);
    
    Logger.log('Form submitted successfully: ' + data.email);
    return createSuccessResponse();
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createErrorResponse('Ошибка сервера: ' + error.toString());
  }
}

// ============================================
// ОБРАБОТКА GET ЗАПРОСОВ (проверка работы)
// ============================================

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: "working", 
      timestamp: new Date(),
      message: "Google Apps Script is running correctly"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ОТВЕТОВ
// ============================================

function createSuccessResponse() {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// ============================================
// EMAIL УВЕДОМЛЕНИЯ
// ============================================

function sendEmailNotification(data) {
  try {
    // Используем указанный email из константы
    if (!NOTIFICATION_EMAIL || NOTIFICATION_EMAIL === 'noise8301@gmail.com') {
      Logger.log('⚠️ ВНИМАНИЕ: Укажите ваш email в константе NOTIFICATION_EMAIL');
    }
    
    // Ограничение: не более 1 письма в 5 минут (защита от спама)
    const cache = CacheService.getScriptCache();
    const lastEmailTime = cache.get('last_email_time');
    const now = Date.now();
    
    if (!lastEmailTime || (now - parseInt(lastEmailTime)) > 300000) { // 5 минут = 300000 мс
      
      MailApp.sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: '🌾 Новая заявка с Landing SOP',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d5016;">Новая заявка с сайта</h2>
            <p><strong>Дата:</strong> ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
            <hr style="border: 1px solid #e0e0e0;">
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; background: #f5f5f5; width: 150px;"><strong>Имя:</strong></td>
                <td style="padding: 8px;">${escapeHtml(data.name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background: #f5f5f5;"><strong>Ферма:</strong></td>
                <td style="padding: 8px;">${escapeHtml(data.farm) || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background: #f5f5f5;"><strong>Email:</strong></td>
                <td style="padding: 8px;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; background: #f5f5f5;"><strong>Телефон:</strong></td>
                <td style="padding: 8px;">${escapeHtml(data.phone) || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background: #f5f5f5;"><strong>Тип фермы:</strong></td>
                <td style="padding: 8px;">${escapeHtml(data['farm-type']) || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background: #f5f5f5;"><strong>Размер:</strong></td>
                <td style="padding: 8px;">${escapeHtml(data['farm-size']) || '-'}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #2d5016;">
              <strong>Сообщение:</strong><br>
              ${escapeHtml(data.message).replace(/\n/g, '<br>')}
            </div>
            
            <hr style="border: 1px solid #e0e0e0; margin-top: 20px;">
            <p style="color: #666; font-size: 12px;">
              Это автоматическое уведомление с формы обратной связи<br>
              <a href="https://ifnoise.github.io/landing-sop/">Landing SOP</a>
            </p>
          </div>
        `
      });
      
      cache.put('last_email_time', now.toString(), 600);
      Logger.log('Email notification sent to ' + NOTIFICATION_EMAIL);
      
    } else {
      Logger.log('Email notification skipped (rate limited)');
    }
    
  } catch (error) {
    Logger.log('Email error: ' + error.toString());
    // Не прерываем выполнение, если email не отправился
  }
}

// ============================================
// ЗАЩИТА ОТ XSS В EMAIL
// ============================================

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================
// ЛОГИРОВАНИЕ ПОДОЗРИТЕЛЬНОЙ АКТИВНОСТИ
// ============================================

function logSuspiciousActivity(reason, data, spreadsheetId) {
  try {
    const logSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Подозрительная активность');
    
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        reason,
        JSON.stringify(data),
        Session.getTemporaryActiveUserKey()
      ]);
      Logger.log('Suspicious activity logged: ' + reason);
    }
  } catch (error) {
    Logger.log('Log error: ' + error.toString());
  }
}

// ============================================
// НАСТРОЙКА ТАБЛИЦЫ (запустите 1 раз вручную)
// ============================================

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();
  
  // Переименовываем первый лист
  sheet.setName('Заявки');
  
  // Очищаем лист
  sheet.clear();
  
  // Устанавливаем заголовки
  const headers = [
    'Дата и время',
    'Имя',
    'Название фермы',
    'Email',
    'Телефон',
    'Тип фермы',
    'Размер фермы',
    'Сообщение'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Форматирование заголовков
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2d5016')
             .setFontColor('#ffffff')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');
  
  // Устанавливаем ширину столбцов
  sheet.setColumnWidth(1, 150); // Дата и время
  sheet.setColumnWidth(2, 150); // Имя
  sheet.setColumnWidth(3, 150); // Название фермы
  sheet.setColumnWidth(4, 200); // Email
  sheet.setColumnWidth(5, 130); // Телефон
  sheet.setColumnWidth(6, 150); // Тип фермы
  sheet.setColumnWidth(7, 150); // Размер фермы
  sheet.setColumnWidth(8, 300); // Сообщение
  
  // Замораживаем первую строку
  sheet.setFrozenRows(1);
  
  // Создаем лист для подозрительной активности
  let logSheet = ss.getSheetByName('Подозрительная активность');
  if (!logSheet) {
    logSheet = ss.insertSheet('Подозрительная активность');
    const logHeaders = ['Дата и время', 'Причина', 'Данные', 'Ключ пользователя'];
    logSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
    logSheet.getRange(1, 1, 1, logHeaders.length)
            .setBackground('#8B0000')
            .setFontColor('#ffffff')
            .setFontWeight('bold');
    logSheet.setColumnWidth(1, 150);
    logSheet.setColumnWidth(2, 200);
    logSheet.setColumnWidth(3, 300);
    logSheet.setColumnWidth(4, 150);
    logSheet.setFrozenRows(1);
  }
  
  Logger.log('✅ Таблица успешно настроена!');
  Logger.log('Листы созданы: "Заявки" и "Подозрительная активность"');
  
  return 'Таблица успешно настроена! Заголовки созданы, форматирование применено.';
}

// ============================================
// МЕНЮ В GOOGLE ТАБЛИЦЕ
// ============================================

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🌾 Landing SOP')
      .addItem('Настроить таблицу', 'setupSheet')
      .addItem('Очистить заявки (оставить заголовки)', 'clearSubmissions')
      .addItem('Проверить статус', 'checkStatus')
      .addToUi();
  } catch (error) {
    // Игнорируем ошибку если запущено не в контексте UI
    Logger.log('onOpen не может быть вызван в этом контексте');
  }
}

// ============================================
// ДОПОЛНИТЕЛЬНЫЕ ПОЛЕЗНЫЕ ФУНКЦИИ
// ============================================

// Очистить все заявки, оставить заголовки
function clearSubmissions() {
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить все заявки? Заголовки останутся.',
      ui.ButtonSet.YES_NO
    );
    
    if (response == ui.Button.YES) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('Заявки');
      
      if (sheet) {
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          sheet.deleteRows(2, lastRow - 1);
          ui.alert('Заявки очищены!');
        } else {
          ui.alert('Таблица уже пуста.');
        }
      }
    }
  } catch (error) {
    Logger.log('Clear error: ' + error.toString());
  }
}

// Проверить статус настройки
function checkStatus() {
  try {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Заявки');
    const logSheet = ss.getSheetByName('Подозрительная активность');
    
    let message = '📊 Статус настройки:\n\n';
    
    if (sheet) {
      const rows = sheet.getLastRow();
      message += '✅ Лист "Заявки" создан (' + (rows - 1) + ' заявок)\n';
    } else {
      message += '❌ Лист "Заявки" не найден\n';
    }
    
    if (logSheet) {
      const logRows = logSheet.getLastRow();
      message += '✅ Лист "Подозрительная активность" создан (' + (logRows - 1) + ' записей)\n';
    } else {
      message += '❌ Лист "Подозрительная активность" не найден\n';
    }
    
    message += '\n📋 ID таблицы:\n' + ss.getId();
    
    ui.alert('Статус', message, ui.ButtonSet.OK);
    
  } catch (error) {
    Logger.log('Status check error: ' + error.toString());
  }
}

// ============================================
// ИНСТРУКЦИЯ ПО ИСПОЛЬЗОВАНИЮ
// ============================================

/*

📝 ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:

1. Замените YOUR_SPREADSHEET_ID_HERE в начале файла на реальный ID вашей таблицы
   (ID можно найти в URL: https://docs.google.com/spreadsheets/d/ВАШТАБЛИЧНЫЙ_ID/edit)

2. Нажмите "Сохранить" (иконка дискеты)

3. Запустите функцию setupSheet():
   - Выберите "setupSheet" в выпадающем списке функций
   - Нажмите "Запустить" (▶️)
   - Разрешите доступ при первом запуске

4. Разверните веб-приложение:
   - Нажмите "Развернуть" → "Новое развертывание"
   - Выберите тип: "Веб-приложение"
   - Настройки:
     * Описание: Landing SOP Form Handler
     * Запуск от имени: Меня (ваш email)
     * Доступ: Все, даже анонимные
   - Нажмите "Развернуть"
   - Скопируйте URL веб-приложения

5. Вставьте URL в файл script.js вашего проекта:
   const GOOGLE_SCRIPT_URL = 'ваш_скопированный_URL';

6. Сохраните, закоммитьте и запушьте изменения

7. Протестируйте форму на сайте

✅ ГОТОВО! Форма будет сохранять данные в Google Таблицу и отправлять вам email уведомления.

*/
