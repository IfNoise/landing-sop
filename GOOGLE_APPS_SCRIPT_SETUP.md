# Настройка Google Apps Script для формы

## Шаг 1: Создание и настройка Google Таблицы

### Вариант А: Автоматическая настройка (рекомендуется)

1. Откройте [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу "Landing SOP - Заявки"
3. В Google Таблице: **Расширения** → **Apps Script**
4. Вставьте следующий код для настройки:

```javascript
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
  
  // Вместо alert используем Logger для совместимости
  Logger.log('✅ Таблица успешно настроена!');
  Logger.log('Теперь скопируйте ID этой таблицы из URL и используйте в коде Apps Script.');
  
  return 'Таблица успешно настроена! Заголовки созданы, форматирование применено.';
}

// Добавляем пункт меню для удобства (работает только при открытии таблицы)
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🌾 Landing SOP')
      .addItem('Настроить таблицу', 'setupSheet')
      .addToUi();
  } catch (error) {
    // Игнорируем ошибку если запущено не в контексте UI
    Logger.log('onOpen не может быть вызван в этом контексте');
  }
}
```

5. Нажмите **Сохранить** (иконка дискеты)
6. Запустите функцию `setupSheet`: выберите `setupSheet` в выпадающем списке и нажмите **Запустить**
7. **Разрешите доступ** при первом запуске
8. Таблица автоматически настроится с правильными заголовками и форматированием

### Вариант Б: Ручная настройка

Если предпочитаете ручную настройку, создайте заголовки в первой строке:
- A1: Дата и время
- B1: Имя
- C1: Название фермы
- D1: Email
- E1: Телефон
- F1: Тип фермы
- G1: Размер фермы
- H1: Сообщение

## Шаг 2: Получение ID таблицы

1. Скопируйте ID из URL таблицы:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
2. Сохраните этот ID - он понадобится в коде

## Шаг 3: Создание Apps Script для обработки формы

1. В Google Таблице: **Расширения** → **Apps Script**
2. Если вы использовали автоматическую настройку из Шага 1, код уже есть - добавьте к нему
3. Если нет, удалите весь существующий код и вставьте следующий:

```javascript
function doPost(e) {
  try {
    const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Замените на ID вашей таблицы
    const MAX_LENGTH = 1000;
    
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
    
    // 4. Проверка длины полей
    if (data.message && data.message.length > MAX_LENGTH) {
      return createErrorResponse('Сообщение слишком длинное');
    }
    
    // 5. Honeypot проверка (защита от ботов)
    if (data.website) {
      logSuspiciousActivity('Honeypot triggered', data, SPREADSHEET_ID);
      return createErrorResponse('Bot detected');
    }
    
    // 6. Санитизация данных
    const sanitize = (str) => str ? str.toString().substring(0, MAX_LENGTH).trim() : '';
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Заявки');
    
    // 7. Сохранение данных в таблицу
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
    
    // 8. Отправка email уведомления
    sendEmailNotification(data);
    
    return createSuccessResponse();
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createErrorResponse('Ошибка сервера: ' + error.toString());
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "working", timestamp: new Date() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createSuccessResponse() {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendEmailNotification(data) {
  try {
    const myEmail = Session.getActiveUser().getEmail();
    
    // Ограничение: не более 1 письма в 5 минут
    const cache = CacheService.getScriptCache();
    const lastEmailTime = cache.get('last_email_time');
    const now = Date.now();
    
    if (!lastEmailTime || (now - parseInt(lastEmailTime)) > 300000) {
      MailApp.sendEmail({
        to: myEmail,
        subject: '🌾 Новая заявка с Landing SOP',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d5016;">Новая заявка с сайта</h2>
            <p><strong>Дата:</strong> ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
            <hr style="border: 1px solid #e0e0e0;">
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; background: #f5f5f5;"><strong>Имя:</strong></td>
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
      Logger.log('Email notification sent to ' + myEmail);
    } else {
      Logger.log('Email notification skipped (rate limited)');
    }
  } catch (error) {
    Logger.log('Email error: ' + error.toString());
  }
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
    }
  } catch (error) {
    Logger.log('Log error: ' + error.toString());
  }
}

// Функция для настройки таблицы (из Шага 1)
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getActiveSheet();
  
  sheet.setName('Заявки');
  sheet.clear();
  
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
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2d5016')
             .setFontColor('#ffffff')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');
  
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(5, 130);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 150);
  sheet.setColumnWidth(8, 300);
  
  sheet.setFrozenRows(1);
  
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
  return 'Таблица успешно настроена!';
}

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🌾 Landing SOP')
      .addItem('Настроить таблицу', 'setupSheet')
      .addToUi();
  } catch (error) {
    Logger.log('onOpen не может быть вызван в этом контексте');
  }
}
```

4. **Замените** `YOUR_SPREADSHEET_ID_HERE` на реальный ID из шага 2
5. Нажмите **Сохранить** (иконка дискеты)

## Шаг 4: Развертывание веб-приложения

1. Нажмите **Развернуть** → **Новое развертывание**
2. Нажмите на шестеренку → выберите **Веб-приложение**
3. Настройки:
   - **Описание**: Landing SOP Form Handler
   - **Запуск от имени**: Меня (ваш email)
   - **У кого есть доступ**: **Все, даже анонимные**
4. Нажмите **Развернуть**
5. **Разрешите доступ** (нажмите "Авторизовать доступ")
6. **Скопируйте URL** веб-приложения - он выглядит так:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

## Шаг 5: Обновление script.js

1. Откройте файл `script.js`
2. Найдите строку:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Замените на ваш URL из шага 4:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
4. Сохраните файл

## Шаг 6: Коммит и деплой

```bash
git add script.js
git commit -m "feat: интеграция формы с Google Sheets"
git push origin main
```

## Тестирование

1. Откройте сайт: https://ifnoise.github.io/landing-sop/
2. Заполните форму
3. Нажмите "Отправить заявку"
4. Проверьте, что данные появились в Google Таблице

## Проблемы и решения

### Ошибка "Script function not found: doPost"
- Убедитесь, что код сохранен в Apps Script
- Создайте новое развертывание

### Форма не отправляется
- Откройте консоль браузера (F12) и проверьте ошибки
- Убедитесь, что URL правильный
- Проверьте, что скрипт развернут с доступом "Все, даже анонимные"

### Данные не попадают в таблицу
- Проверьте правильность SPREADSHEET_ID
- Убедитесь, что вы дали разрешения скрипту
- Проверьте логи в Apps Script: **Выполнение** → **Журнал выполнения**

## Безопасность

### Основные угрозы:
1. **Спам-атаки** - массовая отправка форм ботами
2. **DDoS** - перегрузка сервера запросами
3. **Превышение лимитов** - Google ограничивает 20,000 запросов/день
4. **XSS-инъекции** - вредоносный код в полях формы
5. **Email bombing** - спам на ваш email через уведомления

### Защита уровень 1: Базовая (обязательно)

```javascript
function doPost(e) {
  try {
    const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
    const MAX_LENGTH = 1000; // Максимальная длина поля
    
    // 1. Проверка Content-Type
    if (!e.postData || e.postData.type !== 'application/json') {
      return createErrorResponse('Invalid content type');
    }
    
    const data = JSON.parse(e.postData.contents);
    
    // 2. Валидация обязательных полей
    if (!data.name || !data.email || !data.phone) {
      return createErrorResponse('Missing required fields');
    }
    
    // 3. Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return createErrorResponse('Invalid email format');
    }
    
    // 4. Проверка длины полей (защита от переполнения)
    if (data.message && data.message.length > MAX_LENGTH) {
      return createErrorResponse('Message too long');
    }
    
    // 5. Санитизация данных (удаление опасных символов)
    const sanitize = (str) => str ? str.toString().substring(0, MAX_LENGTH).trim() : '';
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    sheet.appendRow([
      new Date(data.timestamp),
      sanitize(data.name),
      sanitize(data.company),
      sanitize(data.email),
      sanitize(data.phone),
      sanitize(data.interest),
      sanitize(data.facilitySize),
      sanitize(data.message),
      data.newsletter === 'Да' ? 'Да' : 'Нет'
    ]);
    
    return createSuccessResponse();
      
  } catch (error) {
    return createErrorResponse(error.toString());
  }
}

function createSuccessResponse() {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Защита уровень 2: Rate Limiting (рекомендуется)

```javascript
function doPost(e) {
  try {
    // Rate limiting: максимум 10 заявок в час с одного IP
    const cache = CacheService.getScriptCache();
    const clientIP = e.parameter.userip || 'unknown';
    const rateLimitKey = 'rate_' + clientIP;
    
    const requests = parseInt(cache.get(rateLimitKey) || '0');
    if (requests >= 10) {
      return createErrorResponse('Too many requests. Please try again later.');
    }
    
    cache.put(rateLimitKey, (requests + 1).toString(), 3600); // 1 час
    
    // ... остальной код валидации и сохранения
    
  } catch (error) {
    return createErrorResponse(error.toString());
  }
}
```

### Защита уровень 3: Google reCAPTCHA v3 (максимальная защита)

**1. Подключите reCAPTCHA в index.html:**

```html
<!-- В <head> -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

<!-- В script.js, перед отправкой формы: -->
<script>
async function submitForm(formData) {
  // Получаем токен reCAPTCHA
  const token = await grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'});
  formData.recaptchaToken = token;
  
  // Отправляем форму с токеном
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(formData)
  });
}
</script>
```

**2. Проверка на стороне Apps Script:**

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Проверка reCAPTCHA токена
    if (!verifyRecaptcha(data.recaptchaToken)) {
      return createErrorResponse('reCAPTCHA verification failed');
    }
    
    // ... остальной код
    
  } catch (error) {
    return createErrorResponse(error.toString());
  }
}

function verifyRecaptcha(token) {
  const SECRET_KEY = 'YOUR_RECAPTCHA_SECRET_KEY';
  const url = 'https://www.google.com/recaptcha/api/siteverify';
  
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    payload: {
      secret: SECRET_KEY,
      response: token
    }
  });
  
  const result = JSON.parse(response.getContentText());
  return result.success && result.score > 0.5; // Score > 0.5 = вероятно человек
}
```

### Защита уровень 4: Honeypot поле (простая ловушка для ботов)

**В index.html добавьте скрытое поле:**

```html
<!-- Это поле должны видеть только боты -->
<div style="position: absolute; left: -9999px;">
  <input type="text" name="website" id="honeypot" tabindex="-1" autocomplete="off">
</div>
```

**В Apps Script проверяйте:**

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  // Если поле заполнено - это бот!
  if (data.website) {
    return createErrorResponse('Bot detected');
  }
  
  // ... остальной код
}
```

### Защита email уведомлений от спама

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // ... валидация и сохранение ...
    
    // Отправка email только при валидной заявке
    const myEmail = Session.getActiveUser().getEmail();
    
    // Ограничение: не более 1 письма в 5 минут
    const cache = CacheService.getScriptCache();
    const lastEmailTime = cache.get('last_email_time');
    const now = Date.now();
    
    if (!lastEmailTime || (now - parseInt(lastEmailTime)) > 300000) { // 5 минут
      MailApp.sendEmail({
        to: myEmail,
        subject: '🌾 Новая заявка с Landing SOP',
        htmlBody: `
          <h2>Новая заявка с сайта</h2>
          <p><strong>Дата:</strong> ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
          <hr>
          <p><strong>Имя:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Сообщение:</strong><br>${escapeHtml(data.message)}</p>
        `
      });
      
      cache.put('last_email_time', now.toString(), 600);
    }
    
    return createSuccessResponse();
    
  } catch (error) {
    return createErrorResponse(error.toString());
  }
}

// Экранирование HTML для предотвращения XSS в email
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

### Мониторинг и блокировка

**Добавьте логирование подозрительной активности:**

```javascript
function logSuspiciousActivity(reason, data) {
  const logSheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Suspicious');
  
  if (!logSheet) {
    const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
    ss.insertSheet('Suspicious');
  }
  
  logSheet.appendRow([
    new Date(),
    reason,
    JSON.stringify(data),
    Session.getTemporaryActiveUserKey()
  ]);
}

// Использование:
if (requests >= 10) {
  logSuspiciousActivity('Rate limit exceeded', { ip: clientIP, requests: requests });
  return createErrorResponse('Too many requests');
}
```

### Рекомендации по внедрению

**Минимальный уровень (быстро):**
- ✅ Базовая валидация полей
- ✅ Honeypot поле
- ✅ Ограничение длины сообщений
- ⏱️ Время: 10 минут

**Рекомендуемый уровень:**
- ✅ Базовая валидация
- ✅ Rate limiting
- ✅ Honeypot
- ✅ Санитизация данных
- ⏱️ Время: 30 минут

**Максимальный уровень:**
- ✅ Всё из рекомендуемого
- ✅ Google reCAPTCHA v3
- ✅ Логирование
- ✅ Email throttling
- ⏱️ Время: 1-2 часа

### Ограничения Google Apps Script

⚠️ **Важно знать:**
- Лимит: 20,000 запросов/день для веб-приложения
- Лимит: 100 email/день (бесплатный аккаунт)
- Максимальное время выполнения: 30 секунд
- Нельзя получить реальный IP клиента напрямую
- URL будет публичным - это нормально

## Дополнительно: Email уведомления

Чтобы получать уведомления о новых заявках, добавьте в конец функции `doPost`:

```javascript
// Отправка email уведомления
MailApp.sendEmail({
  to: 'your-email@example.com',
  subject: 'Новая заявка с Landing SOP',
  body: `
    Имя: ${data.name}
    Компания: ${data.company}
    Email: ${data.email}
    Телефон: ${data.phone}
    Интерес: ${data.interest}
  `
});
```
